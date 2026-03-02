import { ArrowRight, Users, Calendar, Heart } from 'lucide-react';

export default function Hero() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-spice-purple via-spice-blue to-spice-purple overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold mb-8">
              Welcome to Our Community
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight">
              <span className="font-bold">SPICE</span>{' '}
              <span className="font-extrabold">KREWE</span>
            </h1>

            <p className="text-2xl sm:text-3xl lg:text-4xl text-white/95 font-semibold mb-6">
              Bringing People Together
            </p>

            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join a vibrant community where connections are made, experiences are shared,
              and lasting friendships are formed through unforgettable events and celebrations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={scrollToContact}
              className="group bg-white text-spice-purple px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
            >
              Join Our Community
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            <button
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/50 hover:bg-white/30 transition-all duration-200"
            >
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <Users className="mx-auto mb-3 text-white" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Community First</h3>
              <p className="text-white/80">Building connections that last</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <Calendar className="mx-auto mb-3 text-white" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Exciting Events</h3>
              <p className="text-white/80">Unforgettable experiences await</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <Heart className="mx-auto mb-3 text-white" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Shared Values</h3>
              <p className="text-white/80">Unity, diversity, and celebration</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
