import { Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-spice-purple mb-4">
            About Spice Krewe: Bringing People Together
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-900">Our Story</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Spice Krewe originated in 2010 as a private dinner gathering with a few talented chefs and entrepreneurs. We created a platform to cultivate existing relationships, develop new ones, and build an ecosystem where professional development is the byproduct of personal connections.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission was simple: to foster meaningful connections through shared culinary experiences, celebrating culture, creativity, and community. What started as intimate dinners has grown into a thriving network of culinary professionals and enthusiasts.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Today, Spice Krewe continues to bring people together, creating opportunities for collaboration, learning, and growth within the culinary industry and beyond.
            </p>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-spice-purple to-spice-blue rounded-3xl transform rotate-3 opacity-20"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
              <img
                src="/assets/images/brand/logo-primary.png"
                alt="Spice Krewe Logo"
                className="w-full h-auto max-w-md mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-400"><svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-20 bg-white p-10 rounded-3xl shadow-lg">
          <h3 className="text-3xl font-bold text-spice-purple mb-6 text-center">
            Our Vision: The Culinary Operating System
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            As the industry continues to evolve, Spice Krewe is building the infrastructure to support the next generation of culinary talent. We're developing a comprehensive ecosystem that combines marketplace dynamics, educational excellence, and innovative service delivery. Our platform connects opportunity with talent, provides world-class culinary education, and reimagines how culinary services are delivered in the modern economy.
          </p>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Three Pillars</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-spice-purple">
              <div className="w-16 h-16 bg-spice-purple/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Briefcase className="text-spice-purple" size={32} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Hire</h4>
              <h5 className="text-lg font-semibold text-spice-purple mb-3 text-center">The Marketplace</h5>
              <p className="text-gray-700 leading-relaxed">
                Our dynamic marketplace connects talented culinary professionals with opportunities that match their skills and aspirations. Whether you're seeking full-time positions, freelance gigs, or collaborative projects, Spice Krewe facilitates meaningful employment connections that benefit both professionals and employers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-spice-blue">
              <div className="w-16 h-16 bg-spice-blue/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <GraduationCap className="text-spice-blue" size={32} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Learn</h4>
              <h5 className="text-lg font-semibold text-spice-blue mb-3 text-center">The Academy</h5>
              <p className="text-gray-700 leading-relaxed">
                The Spice Krewe Academy offers comprehensive culinary education programs designed to elevate skills and knowledge. From foundational techniques to advanced specializations, our curriculum combines hands-on training with business acumen, preparing the next generation of culinary leaders for success.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-spice-purple">
              <div className="w-16 h-16 bg-spice-purple/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="text-spice-purple" size={32} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Evolve</h4>
              <h5 className="text-lg font-semibold text-spice-purple mb-3 text-center">Culinary-as-a-Service</h5>
              <p className="text-gray-700 leading-relaxed">
                We're reimagining how culinary services are delivered through innovative, flexible solutions. Our Culinary-as-a-Service model provides businesses and individuals with on-demand access to professional culinary expertise, from menu development to full-scale event catering, adapted to the modern economy.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-spice-purple to-spice-blue p-10 rounded-3xl shadow-2xl text-white">
          <p className="text-xl leading-relaxed text-center max-w-4xl mx-auto">
            At Spice Krewe, we believe that technology shouldn't replace the chef—it should empower them. Our platform is built by culinary professionals, for culinary professionals, ensuring that innovation serves the craft rather than diminishing it. We're not just building a business; we're nurturing a movement that celebrates culinary artistry while embracing the possibilities of tomorrow.
          </p>
        </div>
      </div>
    </section>
  );
}
