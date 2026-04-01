import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Event {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  description: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const response = await api.getEvents();

      if (response.success && Array.isArray(response.data)) {
        setEvents(response.data as Event[]);
      } else {
        setEvents([]);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Upcoming <span className="text-spice-blue">Events</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partner meetups, mixers, and industry events—see what is on the calendar next.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-spice-purple border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              The Krewe is currently in the field. Check back soon for upcoming R&amp;D mixers.
            </p>
            <Link
              to="/contact#message"
              className="inline-flex min-h-[44px] items-center justify-center rounded-sk-md bg-spice-purple px-8 py-3 text-[15px] font-semibold text-white no-underline shadow-md shadow-spice-purple/30 transition-colors hover:bg-spice-blue"
            >
              Contact us
            </Link>
          </div>
        ) : (
          <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <div
                key={event.id ?? `${event.title}-${index}`}
                className="transform overflow-hidden rounded-sk-md border border-sk-card-border bg-gradient-to-br from-gray-50 to-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="flex h-48 items-center justify-center bg-gradient-to-r from-spice-purple to-spice-blue">
                  <Calendar size={64} className="text-white" />
                </div>

                <div className="p-6">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">{event.title}</h3>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={18} className="mr-3 text-spice-purple" />
                      <span className="font-medium">{event.date}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Clock size={18} className="mr-3 text-spice-blue" />
                      <span className="font-medium">{event.time}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin size={18} className="mr-3 text-spice-purple" />
                      <span className="font-medium">{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users size={18} className="mr-3 text-spice-blue" />
                      <span className="font-medium">{event.attendees} attending</span>
                    </div>
                  </div>

                  <p className="mb-6 text-gray-600">{event.description}</p>

                  <button
                    type="button"
                    className="w-full rounded-lg bg-spice-purple py-3 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-spice-blue hover:shadow-lg"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && events.length > 0 ? (
          <div className="text-center">
            <button
              type="button"
              className="rounded-full bg-gray-100 px-8 py-4 font-semibold text-gray-800 shadow-md transition-colors duration-200 hover:bg-gray-200 hover:shadow-lg"
            >
              View All Events
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
