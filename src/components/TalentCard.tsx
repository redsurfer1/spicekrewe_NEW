import { useState, useEffect, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Heart } from 'lucide-react';
import type { TalentRecord } from '../types/talentRecord';
import { useAuth } from '../hooks/useAuth';
import { getSupabaseBrowserOptional } from '../lib/supabase';

type Props = {
  professional: TalentRecord;
  /**
   * When true, profile URL includes `?talentId=<id>` so Hire Flow and analytics can read the same param as `/hire?talentId=`.
   */
  appendTalentIdQuery?: boolean;
  /** Optional extra class on the root link (e.g. grid entrance animation). */
  className?: string;
  /** Optional inline styles (e.g. animation-delay for staggered grid entrance). */
  style?: CSSProperties;
};

export default function TalentCard({ professional: p, appendTalentIdQuery = false, className = '', style }: Props) {
  const [hovered, setHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const supabase = getSupabaseBrowserOptional();

  const profileTo =
    appendTalentIdQuery
      ? `/talent/${encodeURIComponent(p.id)}?talentId=${encodeURIComponent(p.id)}`
      : `/talent/${encodeURIComponent(p.id)}`;

  const firstName = p.name.trim().split(/\s+/)[0] || p.name;
  const hasReviews = p.reviews > 0;

  const showSaveButton = user && role === 'buyer';

  useEffect(() => {
    async function checkIfSaved() {
      if (!supabase || !user || role !== 'buyer') return;

      try {
        const { data } = await supabase
          .from('saved_talent')
          .select('id')
          .eq('buyer_id', user.id)
          .eq('talent_id', p.id)
          .maybeSingle();

        setIsSaved(!!data);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    }

    checkIfSaved();
  }, [supabase, user, role, p.id]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!supabase || role !== 'buyer') return;

    setSavingState(true);
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      if (newSavedState) {
        await supabase
          .from('saved_talent')
          .insert({ buyer_id: user.id, talent_id: p.id });
      } else {
        await supabase
          .from('saved_talent')
          .delete()
          .eq('buyer_id', user.id)
          .eq('talent_id', p.id);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setIsSaved(!newSavedState);
    } finally {
      setSavingState(false);
    }
  };

  return (
    <Link
      to={profileTo}
      className={`group block h-full no-underline text-inherit ${className}`.trim()}
      style={style}
      aria-label={`${p.name} — ${p.role}. Open profile to hire or learn more.`}
    >
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-full min-h-full flex-col rounded-sk-lg border bg-white p-5 transition-[border-color,box-shadow] duration-200 ease-out"
        style={{
          borderColor: hovered ? 'var(--sk-purple)' : 'var(--sk-card-border)',
          boxShadow: hovered ? '0 8px 24px rgba(77, 47, 145, 0.08)' : '0 2px 8px rgba(26, 26, 46, 0.06)',
        }}
      >
        <div className="mb-3.5 flex items-start justify-between">
          <div
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-sk-md text-[17px] font-bold tracking-tight text-white"
            style={{ background: p.avatarColor }}
            aria-hidden
          >
            {p.avatarText}
          </div>

          {showSaveButton && (
            <button
              onClick={handleSaveToggle}
              disabled={savingState}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-sk-card-border bg-white hover:bg-sk-body-bg transition-colors disabled:opacity-50"
              aria-label={isSaved ? 'Remove from saved' : 'Save talent'}
              title={isSaved ? 'Remove from saved' : 'Save talent'}
            >
              <Heart
                size={18}
                className={`transition-colors ${isSaved ? 'fill-red-500 text-red-500' : 'text-sk-text-muted'}`}
              />
            </button>
          )}
        </div>

        <header className="mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-[17px] font-semibold leading-tight text-sk-navy">{p.name}</h3>
            {p.verified ? (
              <span
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sk-gold"
                title="SK Verified"
                aria-label="SK Verified"
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
              </span>
            ) : null}
          </div>
          <p className="m-0 text-[13px] font-medium text-sk-purple">{p.role}</p>
        </header>

        <p className="mb-3 flex-1 text-[13px] leading-normal text-sk-text-muted">{p.specialty}</p>

        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[15px] font-bold text-sk-navy">{p.rate}</span>
          <span className="flex items-center gap-1 text-[13px] text-sk-text-subtle">
            <Star className="h-3.5 w-3.5 shrink-0 fill-sk-gold text-sk-gold" aria-hidden />
            {hasReviews ? (
              <>
                <span className="text-sk-navy">{p.rating.toFixed(1)}</span>
                <span className="text-sk-text-soft">({p.reviews})</span>
              </>
            ) : (
              <span className="text-sk-purple-light">New to the Krewe</span>
            )}
          </span>
        </div>

        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {p.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-sk-pill border border-sk-purple/20 bg-sk-purple-light/25 px-2.5 py-0.5 text-[11px] text-sk-purple"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className={`m-0 mb-4 text-[11px] font-semibold ${p.available ? 'text-sk-purple' : 'text-sk-gold'}`}>
          {p.available ? 'Available for projects' : 'Currently booked'}
        </p>

        <div className="mt-auto border-t border-sk-card-border pt-4">
          <span className="flex w-full min-h-[44px] items-center justify-center rounded-sk-md bg-sk-purple px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-200 ease-out group-hover:bg-sk-navy">
            Hire {firstName}
          </span>
        </div>
      </article>
    </Link>
  );
}
