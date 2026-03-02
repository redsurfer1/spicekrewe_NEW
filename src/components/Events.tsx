import { Calendar, MapPin, Clock, Users } from 'lucide-react';

export default function Events() {
  const upcomingEvents = [
    {
      title: 'Summer Social Mixer',
      date: 'June 15, 2026',
      time: '6:00 PM - 10:00 PM',
      location: 'Downtown Community Center',
      attendees: 120,
      description: 'Join us for an evening of networking, live music, and delicious food as we celebrate the start of summer.',
    },
    {
      title: 'Cultural Celebration Festival',
      date: 'July 20, 2026',
      time: '2:00 PM - 8:00 PM',
      location: 'City Park Pavilion',
      attendees: 250,
      description: 'Experience diverse cultures through food, music, dance, and art in our biggest event of the year.',
    },
    {
      title: 'Community Game Night',
      date: 'August 5, 2026',
      time: '7:00 PM - 11:00 PM',
      location: 'Spice Krewe Headquarters',
      attendees: 60,
      description: 'A fun-filled evening of board games, card games, and friendly competition with fellow krewe members.',
    },
  ];

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Upcoming <span className="text-spice-blue">Events</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exciting opportunities to connect, celebrate, and create lasting memories with our community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {upcomingEvents.map((event, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
            >
              <div className="bg-gradient-to-r from-spice-purple to-spice-blue h-48 flex items-center justify-center">
                <Calendar size={64} className="text-white" />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h3>

                <div className="space-y-3 mb-4">
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

                <p className="text-gray-600 mb-6">{event.description}</p>

                <button className="w-full bg-spice-purple text-white py-3 rounded-lg font-semibold hover:bg-spice-blue transition-colors duration-200 shadow-md hover:shadow-lg">
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-gray-100 text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors duration-200 shadow-md hover:shadow-lg">
            View All Events
          </button>
        </div>
      </div>
    </section>
  );
}
