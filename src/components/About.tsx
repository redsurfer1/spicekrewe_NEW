import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useCity } from '../context/CityContext';

interface ContentData {
  story?: string;
  vision?: string;
  pillars?: {
    hire?: string;
    learn?: string;
    evolve?: string;
  };
  closing?: string;
}

export default function About() {
  const { cityDisplayName } = useCity();
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const response = await api.getContent();

      if (response.success && response.data) {
        setContent(response.data);
      }

      setLoading(false);
    };

    void fetchContent();
  }, []);

  const defaultContent = {
    story:
      'SpiceKrewe was built in Memphis to solve a simple problem: booking a private chef or food truck for an event was harder than it needed to be.',
    vision:
      'Phone calls, unanswered emails, and guesswork about pricing. We built a better way — a verified network, a free AI concierge, and secure payment so hosts can focus on the guest list — not the chase.',
    pillars: {
      hire: `Today SpiceKrewe connects ${cityDisplayName} with its best culinary professionals — vetted, verified, and ready to make your next event unforgettable.`,
      learn: 'Real chefs. Real trucks. Beautifully simple booking — from intimate dinners to corporate lots and outdoor gatherings.',
      evolve:
        'We obsess over trust: clear expectations, transparent pricing context, and providers who show up prepared — because your event deserves more than a vague “we’ll figure it out.”',
    },
    closing: `${cityDisplayName}. Real chefs. Real trucks. Beautifully simple booking.`,
  };

  const displayContent = content || defaultContent;

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-spice-purple mb-4">About SpiceKrewe</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-spice-purple border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 sm:mb-20">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">Our story</h3>
                <p className="text-lg text-gray-700 leading-relaxed">{displayContent.story}</p>
                <p className="text-lg text-gray-700 leading-relaxed">{displayContent.vision}</p>
                <p className="text-lg text-gray-700 leading-relaxed">{displayContent.pillars?.hire}</p>
                <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-spice-purple mb-2">What hosts tell us</p>
                  <p className="text-gray-700 italic leading-relaxed">
                    “Finally — one place to compare real pros, get a straight answer on fit, and book without the runaround.”
                  </p>
                </div>
              </div>

              <div className="relative flex justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-spice-purple to-spice-blue rounded-3xl transform rotate-3 opacity-20"></div>
                <div className="relative bg-white p-8 border border-sk-card-border rounded-sk-md shadow-2xl">
                  <img
                    src="/assets/brand/logo-primary.png"
                    alt="SpiceKrewe"
                    className="w-full h-auto max-w-md mx-auto"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mb-20 bg-white p-10 border border-sk-card-border rounded-sk-md shadow-lg">
              <h3 className="text-3xl font-bold text-spice-purple mb-6 text-center">Built for events — not noise</h3>
              <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
                {displayContent.pillars?.learn}
              </p>
            </div>

            <div className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">How we work with the Krewe</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-sk-md border border-sk-card-border border-t-4 border-t-spice-purple shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Verify</h4>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Providers earn trust with credentials, portfolio review, and consistent delivery — not keyword stuffing.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-sk-md border border-sk-card-border border-t-4 border-t-spice-blue shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Match</h4>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Our concierge helps buyers choose between (or combine) private chefs and food trucks for the guest
                    count and vibe.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-sk-md border border-sk-card-border border-t-4 border-t-spice-purple shadow-lg">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Pay</h4>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Secure payment with clear expectations — so hosts and providers can focus on the event.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-spice-purple to-spice-blue p-10 border border-sk-card-border rounded-sk-md shadow-2xl text-white">
              <p className="text-xl leading-relaxed text-center max-w-4xl mx-auto">
                {displayContent.pillars?.evolve}
              </p>
              <p className="text-xl leading-relaxed text-center max-w-4xl mx-auto mt-6 font-semibold">
                {displayContent.closing}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
