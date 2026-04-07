import { Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Seasonal booking prompts — no `/api/events` dependency (narrow model).
 */
export default function Events() {
  const cards = [
    {
      title: 'Spring wedding season — book early',
      body: 'Private chefs and food trucks fill fast for April–June. Lock your date with the concierge.',
      icon: Calendar,
    },
    {
      title: 'Corporate Q2 events — food trucks available',
      body: 'Lunch drops, parking-lot parties, and outdoor gatherings for 20–200+ guests.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Booking <span className="text-spice-blue">season</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Popular times to reserve Memphis private chefs and food trucks — plan ahead with SpiceKrewe.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {cards.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="flex flex-col rounded-sk-lg border border-sk-card-border bg-gradient-to-br from-gray-50 to-white p-8 shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sk-md bg-spice-purple/10 text-spice-purple">
                <Icon size={26} strokeWidth={2} aria-hidden />
              </div>
              <h3 className="m-0 mb-3 text-xl font-bold text-gray-900">{title}</h3>
              <p className="m-0 mb-6 flex-1 text-[15px] leading-relaxed text-gray-600">{body}</p>
              <Link
                to="/concierge"
                className="inline-flex min-h-[44px] w-fit items-center justify-center rounded-sk-md px-6 py-2.5 text-sm font-bold text-white no-underline shadow-md transition-opacity hover:opacity-95"
                style={{ backgroundColor: '#4d2f91', fontFamily: '"Barlow Condensed", system-ui, sans-serif' }}
              >
                Plan my event
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
