// CLEAN MODEL 2026-04-02: Client-side Stripe Checkout redirect removed per Flomisma clean model (MOBILE_CODE_REVIEW_v1.md C1).
// Milestone payments return after Stripe Connect onboarding + backend-created PaymentIntents. See PaymentPlaceholder below.

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, Users } from 'lucide-react';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import BriefExplainer from '../components/BriefExplainer';
import { fetchTalentDirectory, getTalentById, TALENT_FALLBACK } from '../data/talent';
import type { TalentRecord } from '../types/talentRecord';
import type { CulinaryNeedSummary } from '../lib/ai/briefGenerator';
import type { MatchRecommendation } from '../lib/ai/matchmaker';
import { parseHireBrief } from '../lib/validation';
import { patchBriefRecord, submitProjectBrief } from '../lib/brief-api';
import { getSupabaseBrowserOptional } from '../lib/supabase';

const STEPS = 3;

export function PaymentPlaceholder() {
  return (
    <div
      className="payment-coming-soon"
      style={{
        padding: '16px 18px',
        borderRadius: 'var(--sk-radius-md)',
        border: '1px solid var(--sk-card-border)',
        background: 'var(--sk-surface)',
      }}
    >
      <p style={{ margin: 0, fontSize: 15, color: 'var(--sk-text-muted)', lineHeight: 1.55 }}>
        Milestone payments are coming soon. Your booking request has been submitted.
      </p>
    </div>
  );
}

function requiredSkillsForBookingNeed(need: 'private_chef' | 'food_truck' | 'both'): string[] {
  if (need === 'private_chef') return ['Private chef (intimate events)'];
  if (need === 'food_truck') return ['Food truck (gatherings & outdoor events)'];
  return ['Private chef (intimate events)', 'Food truck (gatherings & outdoor events)'];
}

export default function HireFlow() {
  const [searchParams] = useSearchParams();
  const talentId =
    searchParams.get('talentId')?.trim() || searchParams.get('providerId')?.trim() || '';
  const [hireRoster, setHireRoster] = useState<TalentRecord[]>(() => [...TALENT_FALLBACK]);

  useEffect(() => {
    let cancelled = false;
    fetchTalentDirectory().then((list) => {
      if (!cancelled) setHireRoster(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const talentResult = talentId ? getTalentById(talentId, hireRoster) : null;
  const hiringName = talentResult?.success ? talentResult.data.name : null;

  const [step, setStep] = useState<1 | 2 | 3 | 'payment' | 'success'>(1);
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  /** Contact email for the brief row (`client_email`); prefilled from Supabase auth when signed in. */
  const [clientEmail, setClientEmail] = useState('');
  const [clientEmailFromAuth, setClientEmailFromAuth] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [eventBookingNeed, setEventBookingNeed] = useState<'private_chef' | 'food_truck' | 'both'>('private_chef');
  const [specialRequests, setSpecialRequests] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<CulinaryNeedSummary | null>(null);
  const [lastBriefedDescription, setLastBriefedDescription] = useState<string | null>(null);
  const [step1Hint, setStep1Hint] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const [matchmakerLoading, setMatchmakerLoading] = useState(false);
  const [topMatches, setTopMatches] = useState<MatchRecommendation[] | null>(null);
  const [primaryInterestTalentIds, setPrimaryInterestTalentIds] = useState<string[]>([]);

  const [savedBriefRecordId, setSavedBriefRecordId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const progressPct =
    step === 'success' || step === 'payment' ? 100 : ((step as number) / STEPS) * 100;

  useEffect(() => {
    const sb = getSupabaseBrowserOptional();
    if (!sb) return;
    void sb.auth.getSession().then(({ data }) => {
      const em = data.session?.user?.email?.trim();
      if (em) {
        setClientEmail(em);
        setClientEmailFromAuth(true);
      }
    });
  }, []);

  const handleStep1Continue = useCallback(async () => {
    const d = description.trim();
    if (d.length < 10) {
      setStep1Hint('Please add at least a few sentences (10+ characters) so we can understand your project.');
      return;
    }
    setStep1Hint(null);
    setValidationError(null);

    if (d === lastBriefedDescription && aiSummary) {
      setStep(2);
      return;
    }

    setAiLoading(true);
    try {
      const ai = await import('../lib/ai/briefGenerator');
      const summary = await ai.generateCulinaryNeedBrief(d);
      setAiSummary(summary);
    } catch {
      const ai = await import('../lib/ai/briefGenerator');
      setAiSummary(ai.buildFallbackCulinarySummary(d));
    } finally {
      setAiLoading(false);
      setLastBriefedDescription(d);
      setStep(2);
    }
  }, [description, lastBriefedDescription, aiSummary]);

  const togglePrimaryInterest = useCallback((professionalId: string) => {
    setPrimaryInterestTalentIds((prev) =>
      prev.includes(professionalId) ? prev.filter((id) => id !== professionalId) : [...prev, professionalId],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    setValidationError(null);
    setPaymentError(null);
    const requiredSkills = requiredSkillsForBookingNeed(eventBookingNeed);
    const extra = specialRequests.trim();
    const fullDescription =
      extra.length > 0 ? `${description.trim()}\n\nSpecial requests: ${extra}` : description.trim();
    const parsed = parseHireBrief({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      projectTitle: projectTitle.trim(),
      budgetRange: budgetRange.trim(),
      timeline: timeline.trim(),
      description: fullDescription,
      requiredSkills,
      primaryInterestTalentIds,
      sourceTalentId: talentId.trim() || undefined,
    });

    if (!parsed.ok) {
      setValidationError(parsed.message);
      return;
    }

    setSubmitLoading(true);
    const submitted = await submitProjectBrief(parsed.data);
    setSubmitLoading(false);

    if (!submitted.success) {
      setValidationError(submitted.error.message);
      return;
    }

    setSavedBriefRecordId(submitted.data.recordId);
    setPaymentError(null);
    setStep('payment');
  }, [
    clientName,
    clientEmail,
    projectTitle,
    budgetRange,
    timeline,
    description,
    specialRequests,
    eventBookingNeed,
    primaryInterestTalentIds,
    talentId,
  ]);

  const handleCompleteStandard = useCallback(async () => {
    if (!savedBriefRecordId) return;
    setPaymentError(null);
    setCheckoutLoading(true);
    await patchBriefRecord(savedBriefRecordId, { PostingTier: 'Standard' });
    setCheckoutLoading(false);
    setStep('success');
  }, [savedBriefRecordId]);

  const reviewPayload = useMemo(() => {
    const needLabel =
      eventBookingNeed === 'private_chef'
        ? 'Private chef (intimate events)'
        : eventBookingNeed === 'food_truck'
          ? 'Food truck (gatherings & outdoor events)'
          : 'Private chef or food truck (concierge decides)';
    return {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      projectTitle: projectTitle.trim(),
      budgetRange: budgetRange.trim(),
      timeline: timeline.trim(),
      description: description.trim(),
      specialRequests: specialRequests.trim(),
      bookingNeedLabel: needLabel,
      requiredSkills: requiredSkillsForBookingNeed(eventBookingNeed),
    };
  }, [
    clientName,
    clientEmail,
    projectTitle,
    budgetRange,
    timeline,
    description,
    specialRequests,
    eventBookingNeed,
  ]);

  useEffect(() => {
    if (step !== 3) {
      setTopMatches(null);
      setMatchmakerLoading(false);
      return;
    }

    let cancelled = false;
    setMatchmakerLoading(true);
    setTopMatches(null);

    const briefText = [reviewPayload.projectTitle, reviewPayload.description].filter(Boolean).join('\n\n');

    void import('../lib/ai/matchmaker')
      .then(({ findTopMatches }) => findTopMatches(briefText, hireRoster))
      .then((res) => {
        if (cancelled) return;
        setMatchmakerLoading(false);
        if (res.success && res.data.matches.length > 0) {
          setTopMatches(res.data.matches);
        } else {
          setTopMatches(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatchmakerLoading(false);
          setTopMatches(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [step, hireRoster, reviewPayload.projectTitle, reviewPayload.description]);

  useEffect(() => {
    if (!topMatches?.length) return;
    setPrimaryInterestTalentIds((prev) => prev.filter((id) => topMatches.some((m) => m.professionalId === id)));
  }, [topMatches]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--sk-body-bg)' }}>
      <SEO title="Tell us about your event – SpiceKrewe" path="/hire" />
      <Navbar />

      <main style={{ flex: 1, padding: '24px 16px 48px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto 16px', boxSizing: 'border-box' }}>
          <BriefExplainer />
        </div>
        <div
          style={{
            maxWidth: 560,
            width: '100%',
            margin: '0 auto',
            background: 'var(--sk-surface)',
            borderRadius: 'var(--sk-radius-lg)',
            border: '1px solid var(--sk-card-border)',
            boxShadow: '0 8px 32px rgba(26, 26, 46, 0.06)',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          {/* Progress — min height + full width track avoids “squish” on narrow viewports */}
          <div style={{ padding: '16px 16px 0', boxSizing: 'border-box' }} className="sm:px-6 sm:pt-5">
            <div
              style={{
                width: '100%',
                minWidth: 0,
                height: 8,
                borderRadius: 'var(--sk-radius-pill)',
                background: 'var(--sk-purple-light)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  minWidth: progressPct > 0 ? 4 : 0,
                  width: `${progressPct}%`,
                  borderRadius: 'var(--sk-radius-pill)',
                  background: 'var(--sk-purple)',
                  transition: 'width 0.35s ease',
                }}
              />
            </div>
            <p
              style={{
                margin: '10px 0 0',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--sk-muted-purple)',
              }}
            >
              {step === 'success'
                ? 'Complete'
                : step === 'payment'
                  ? 'Payment'
                  : `Step ${step} of ${STEPS}`}
            </p>
          </div>

          {hiringName ? (
            <div
              style={{
                margin: '12px 24px 0',
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 'var(--sk-radius-pill)',
                background: 'rgba(230, 168, 0, 0.14)',
                border: '1px solid rgba(230, 168, 0, 0.35)',
                color: 'var(--sk-gold)',
              }}
            >
              Hiring {hiringName}
            </div>
          ) : null}

          <div style={{ padding: '20px 16px 28px', boxSizing: 'border-box' }} className="sm:px-7 sm:pb-8">
            {validationError ? (
              <div
                role="alert"
                style={{
                  marginBottom: 20,
                  padding: '12px 14px',
                  borderRadius: 'var(--sk-radius-md)',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.35)',
                  color: '#991b1b',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {validationError}
              </div>
            ) : null}

            {paymentError ? (
              <div
                role="alert"
                style={{
                  marginBottom: 20,
                  padding: '12px 14px',
                  borderRadius: 'var(--sk-radius-md)',
                  background: 'rgba(220, 38, 38, 0.08)',
                  border: '1px solid rgba(220, 38, 38, 0.35)',
                  color: '#991b1b',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {paymentError}
              </div>
            ) : null}

            {step === 'success' ? (
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: 'var(--sk-purple-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={28} color="var(--sk-purple)" strokeWidth={2} />
                </div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--sk-navy)',
                    margin: '0 0 12px',
                    lineHeight: 1.3,
                  }}
                >
                  Event request received
                </h1>
                <p style={{ margin: 0, fontSize: 15, color: 'var(--sk-text-subtle)', lineHeight: 1.65 }}>
                  Our concierge is matching you with verified chefs and trucks. The SpiceKrewe team will follow up
                  shortly.
                </p>
              </div>
            ) : null}

            {step === 1 ? (
              <>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--sk-navy)',
                    margin: '0 0 8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Tell us about your event
                </h1>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--sk-text-subtle)', lineHeight: 1.55 }}>
                  Guest count, vibe, dietary needs, and venue help us match the right private chef or food truck.
                </p>
                <label htmlFor="hire-description" style={{ fontSize: 13, fontWeight: 600, color: 'var(--sk-navy)' }}>
                  Tell us about your event
                </label>
                <textarea
                  id="hire-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={10}
                  disabled={aiLoading}
                  placeholder="Example: 24 guests for a backyard anniversary in Midtown—BBQ-forward menu, two vegetarians, need service and cleanup wrapped by 9pm…"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    marginTop: 8,
                    padding: '14px 16px',
                    fontSize: 16,
                    lineHeight: 1.55,
                    borderRadius: 'var(--sk-radius-md)',
                    border: '1px solid var(--sk-card-border)',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: 200,
                    color: 'var(--sk-navy)',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {step1Hint ? (
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: '#b45309' }}>{step1Hint}</p>
                ) : null}
                {aiLoading ? (
                  <p
                    style={{
                      margin: '14px 0 0',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--sk-purple)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid var(--sk-card-border)',
                        borderTopColor: 'var(--sk-purple)',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'sk-spin 0.7s linear infinite',
                      }}
                    />
                    Generating summary…
                  </p>
                ) : null}
                <style>{`@keyframes sk-spin { to { transform: rotate(360deg); } }`}</style>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--sk-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Event details
                </h1>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--sk-text-subtle)' }}>
                  Tell us who you are and what you&apos;re looking to book.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Field label="Your name" htmlFor="hire-client">
                    <input
                      id="hire-client"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                  <Field
                    label="Email"
                    htmlFor="hire-client-email"
                    hint={
                      clientEmailFromAuth
                        ? 'Using your signed-in account email for confirmations and matching updates.'
                        : 'Required — we use this for payment confirmations and project updates.'
                    }
                  >
                    <input
                      id="hire-client-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      readOnly={clientEmailFromAuth}
                      required
                      aria-required="true"
                      style={{
                        ...inputStyle,
                        ...(clientEmailFromAuth ? { background: 'var(--sk-body-bg)', cursor: 'not-allowed' } : {}),
                      }}
                    />
                  </Field>
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--sk-navy)' }}>
                      What are you looking for?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(
                        [
                          { id: 'need-chef', value: 'private_chef' as const, icon: '🍽', title: 'Private Chef', sub: 'Intimate events, dinners, celebrations' },
                          { id: 'need-truck', value: 'food_truck' as const, icon: '🚚', title: 'Food Truck', sub: 'Larger gatherings, corporate & outdoor events' },
                          { id: 'need-both', value: 'both' as const, icon: '🎉', title: 'Both — let the concierge decide', sub: 'We’ll recommend the best fit' },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.value}
                          htmlFor={opt.id}
                          style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            padding: '12px 14px',
                            borderRadius: 'var(--sk-radius-md)',
                            border:
                              eventBookingNeed === opt.value
                                ? '2px solid #4d2f91'
                                : '1px solid var(--sk-card-border)',
                            cursor: 'pointer',
                            background: eventBookingNeed === opt.value ? 'rgba(77, 47, 145, 0.06)' : 'var(--sk-surface)',
                          }}
                        >
                          <input
                            id={opt.id}
                            type="radio"
                            name="event-booking-need"
                            checked={eventBookingNeed === opt.value}
                            onChange={() => setEventBookingNeed(opt.value)}
                            style={{ marginTop: 4, accentColor: '#4d2f91' }}
                          />
                          <span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sk-navy)' }}>
                              {opt.icon} {opt.title}
                            </span>
                            <span style={{ display: 'block', fontSize: 13, color: 'var(--sk-text-muted)', marginTop: 4 }}>
                              {opt.sub}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="Event name" htmlFor="hire-title">
                    <input
                      id="hire-title"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Johnson anniversary dinner"
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Event budget" htmlFor="hire-budget">
                    <input
                      id="hire-budget"
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      placeholder="e.g. $2.5k–$4k all-in"
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="Event date" htmlFor="hire-timeline">
                    <input
                      id="hire-timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. Saturday, May 18 — dinner service 6–9pm"
                      style={inputStyle}
                    />
                  </Field>
                  <Field
                    label="Special requests"
                    htmlFor="hire-special"
                    hint="Optional — parking, equipment, kids menu, surprise dessert, etc."
                  >
                    <input
                      id="hire-special"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--sk-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Review & submit
                </h1>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--sk-text-subtle)' }}>
                  Confirm everything looks right, then submit your brief.
                </p>

                {matchmakerLoading ? (
                  <div style={{ marginBottom: 24 }} aria-busy="true" aria-label="Finding recommended professionals">
                    <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--sk-navy)' }}>
                      Matching your brief to the Krewe…
                    </p>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 72,
                          marginBottom: 10,
                          borderRadius: 'var(--sk-radius-md)',
                          border: '1px solid var(--sk-card-border)',
                          background: 'linear-gradient(90deg, var(--sk-gold-light) 20%, var(--sk-body-bg) 50%, var(--sk-gold-light) 80%)',
                          backgroundSize: '200% 100%',
                          animation: 'sk-hire-shimmer 1.1s ease-in-out infinite',
                        }}
                      />
                    ))}
                    <style>{`@keyframes sk-hire-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
                  </div>
                ) : null}

                {!matchmakerLoading && topMatches && topMatches.length > 0 ? (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Users size={20} color="var(--sk-gold)" strokeWidth={2.2} aria-hidden />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: 'var(--sk-navy)',
                        }}
                      >
                        Top recommended professionals for this project
                      </span>
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {topMatches.map((m) => (
                        <li
                          key={m.professionalId}
                          style={{
                            borderRadius: 'var(--sk-radius-md)',
                            border: '1px solid rgba(230, 168, 0, 0.35)',
                            overflow: 'hidden',
                            background: 'var(--sk-surface)',
                          }}
                        >
                          <div
                            style={{
                              padding: '12px 14px',
                              borderBottom: '1px solid var(--sk-card-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Link
                              to={`/talent/${encodeURIComponent(m.professionalId)}`}
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: 'var(--sk-purple)',
                                textDecoration: 'none',
                              }}
                            >
                              {m.name}
                            </Link>
                            <label
                              htmlFor={`hire-primary-${m.professionalId}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--sk-navy)',
                                cursor: 'pointer',
                                userSelect: 'none',
                              }}
                            >
                              <input
                                id={`hire-primary-${m.professionalId}`}
                                type="checkbox"
                                checked={primaryInterestTalentIds.includes(m.professionalId)}
                                onChange={() => togglePrimaryInterest(m.professionalId)}
                                style={{ width: 18, height: 18, accentColor: 'var(--sk-purple)' }}
                              />
                              Primary interest
                            </label>
                          </div>
                          <div
                            style={{
                              padding: '12px 14px',
                              background: 'var(--sk-gold-light)',
                              fontSize: 14,
                              lineHeight: 1.55,
                              color: 'var(--sk-navy)',
                            }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--sk-gold)', display: 'block', marginBottom: 6 }}>
                              Reason for match
                            </span>
                            {m.reason}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {!matchmakerLoading && (!topMatches || topMatches.length === 0) && aiSummary ? (
                  <div
                    style={{
                      marginBottom: 24,
                      padding: '16px 18px',
                      borderRadius: 'var(--sk-radius-md)',
                      background: 'var(--sk-purple-light)',
                      border: '1px solid rgba(77, 47, 145, 0.18)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Sparkles size={18} color="var(--sk-purple)" strokeWidth={2.2} aria-hidden />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--sk-purple)',
                        }}
                      >
                        Smart suggestion
                      </span>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: 'var(--sk-navy)', lineHeight: 1.4 }}>
                      {aiSummary.headline}
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: 'var(--sk-purple)' }}>
                      Suggested next steps
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--sk-text-muted)', fontSize: 14, lineHeight: 1.55 }}>
                      {aiSummary.suggestedDeliverables.map((item) => (
                        <li key={item} style={{ marginBottom: 6 }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <ReviewBlock title="Client" value={reviewPayload.clientName} />
                <ReviewBlock title="Email" value={reviewPayload.clientEmail} />
                <ReviewBlock title="Event" value={reviewPayload.projectTitle} />
                <ReviewBlock title="Budget" value={reviewPayload.budgetRange} />
                <ReviewBlock title="Event date" value={reviewPayload.timeline} />
                <ReviewBlock title="Looking for" value={reviewPayload.bookingNeedLabel} />
                <ReviewBlock title="Special requests" value={reviewPayload.specialRequests || '—'} />
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sk-navy)', marginBottom: 6 }}>
                    Event details
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: 'var(--sk-text-muted)',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      padding: '12px 14px',
                      borderRadius: 'var(--sk-radius-md)',
                      background: 'var(--sk-body-bg)',
                      border: '1px solid var(--sk-card-border)',
                    }}
                  >
                    {reviewPayload.description}
                  </p>
                </div>

              </>
            ) : null}

            {step === 'payment' ? (
              <>
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: 'var(--sk-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Next steps
                </h1>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--sk-text-subtle)', lineHeight: 1.55 }}>
                  Your request is saved. Finish below to confirm your standard listing (no charge until the event is
                  confirmed).
                </p>
                <PaymentPlaceholder />
                <p style={{ margin: '16px 0 0', fontSize: 13, color: 'var(--sk-text-muted)', lineHeight: 1.55 }}>
                  You will not be charged until your event is confirmed. Secure payment via Stripe.
                </p>
              </>
            ) : null}

            {step !== 'success' && step !== 'payment' ? (
              <div
                className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center"
                style={{ marginTop: 28 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setValidationError(null);
                    if (step === 1) return;
                    if (step === 2) setStep(1);
                    if (step === 3) setStep(2);
                  }}
                  disabled={step === 1 || aiLoading}
                  className="w-full sm:w-auto"
                  style={{
                    ...ghostBtn,
                    opacity: step === 1 || aiLoading ? 0.45 : 1,
                    cursor: step === 1 || aiLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1) void handleStep1Continue();
                      if (step === 2) setStep(3);
                    }}
                    disabled={aiLoading}
                    className="w-full sm:w-auto"
                    style={{
                      ...primaryBtn,
                      opacity: aiLoading ? 0.7 : 1,
                      cursor: aiLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {step === 1 && aiLoading ? 'Please wait…' : 'Continue'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={submitLoading}
                    className="w-full sm:w-auto"
                    style={{
                      ...primaryBtn,
                      opacity: submitLoading ? 0.75 : 1,
                      cursor: submitLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {submitLoading ? 'Saving…' : 'Submit event request'}
                  </button>
                )}
              </div>
            ) : null}
            {step === 3 ? (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--sk-text-muted)', lineHeight: 1.55 }}>
                You will not be charged until your event is confirmed. Secure payment via Stripe.
              </p>
            ) : null}

            {step === 'payment' ? (
              <div
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end"
                style={{ marginTop: 28 }}
              >
                <button
                  type="button"
                  onClick={() => void handleCompleteStandard()}
                  disabled={checkoutLoading}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                  style={{
                    ...primaryBtn,
                    opacity: checkoutLoading ? 0.75 : 1,
                    cursor: checkoutLoading ? 'wait' : 'pointer',
                  }}
                >
                  {checkoutLoading ? 'Please wait…' : 'Finish — confirm standard listing'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minHeight: 48,
  padding: '12px 14px',
  fontSize: 16,
  borderRadius: 'var(--sk-radius-md)',
  border: '1px solid var(--sk-card-border)',
  outline: 'none',
  color: 'var(--sk-navy)',
  boxSizing: 'border-box',
};

const ghostBtn: CSSProperties = {
  minHeight: 44,
  padding: '12px 20px',
  fontSize: 16,
  fontWeight: 600,
  borderRadius: 'var(--sk-radius-md)',
  border: '1px solid rgba(77, 47, 145, 0.35)',
  background: 'transparent',
  color: 'var(--sk-purple)',
  boxSizing: 'border-box',
};

const primaryBtn: CSSProperties = {
  minHeight: 44,
  padding: '12px 22px',
  fontSize: 16,
  fontWeight: 700,
  borderRadius: 'var(--sk-radius-md)',
  border: 'none',
  background: '#4d2f91',
  color: '#fff',
  boxSizing: 'border-box',
  fontFamily: '"Barlow Condensed", system-ui, sans-serif',
};

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} style={{ fontSize: 13, fontWeight: 600, color: 'var(--sk-navy)' }}>
        {label}
      </label>
      {hint ? <p style={{ margin: '4px 0 6px', fontSize: 12, color: 'var(--sk-text-soft)' }}>{hint}</p> : null}
      {!hint ? <div style={{ height: 6 }} /> : null}
      {children}
    </div>
  );
}

function ReviewBlock({ title, value }: { title: string; value: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sk-navy)', margin: '0 0 4px' }}>{title}</p>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--sk-text-muted)' }}>{value || '—'}</p>
    </div>
  );
}

