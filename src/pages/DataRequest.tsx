import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useState, type FormEvent } from 'react';

type RequestType =
  | 'access'
  | 'delete'
  | 'correct'
  | 'other';

export default function DataRequestPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('access');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/data-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          request_type: requestType,
          description,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(json?.error || res.statusText);
      }
      setSuccess("Your request has been received. We'll respond within 30 days.");
      setFullName('');
      setEmail('');
      setDescription('');
      setRequestType('access');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sk-body-bg">
      <SEO
        title="Data Request – Spice Krewe"
        description="Request access, correction, or deletion of your personal data."
        path="/data-request"
      />
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-sk-navy mb-2">Data request</h1>
        <p className="text-sm text-sk-text-subtle mb-6">
          Use this form to request a copy of your data, ask for corrections, or request deletion of
          your account and associated personal data. We respond to all requests within 30 days.
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-sk-lg border border-sk-card-border p-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-sk-navy mb-1">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              required
              maxLength={200}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-sk-md border border-sk-card-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sk-purple"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-sk-navy mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sk-md border border-sk-card-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sk-purple"
            />
          </div>

          <div>
            <label htmlFor="requestType" className="block text-sm font-medium text-sk-navy mb-1">
              Request type
            </label>
            <select
              id="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
              className="w-full rounded-sk-md border border-sk-card-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sk-purple bg-white"
            >
              <option value="access">Access my data (export)</option>
              <option value="delete">Delete my account and data</option>
              <option value="correct">Correct my personal information</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-sk-navy mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={4000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-sk-md border border-sk-card-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sk-purple"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-700">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-sk-md bg-sk-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3d2472] disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

