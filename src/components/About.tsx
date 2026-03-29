import { Briefcase, GraduationCap, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

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

    fetchContent();
  }, []);

  const defaultContent = {
    story:
      "Spice Krewe originated in 2010 as a private dinner gathering with a few talented chefs and entrepreneurs. From crawfish seasons to pop-ups and collabs, we cultivated relationships first—then built the rails so professionals could work the way they want: clear scope, great delivery, and outcomes that feel inevitable.",
    vision: "As the industry continues to evolve, Spice Krewe is building the infrastructure to support the next generation of culinary talent. We're developing a comprehensive ecosystem that combines marketplace dynamics, educational excellence, and innovative service delivery.",
    pillars: {
      hire: "Our dynamic marketplace connects talented culinary professionals with opportunities that match their skills and aspirations. Whether you're seeking full-time positions, freelance gigs, or collaborative projects, Spice Krewe facilitates meaningful employment connections that benefit both professionals and employers.",
      learn: "The Spice Krewe Academy offers comprehensive culinary education programs designed to elevate skills and knowledge. From foundational techniques to advanced specializations, our curriculum combines hands-on training with business acumen, preparing the next generation of culinary leaders for success.",
      evolve: "We're reimagining how culinary services are delivered through innovative, flexible solutions. Our Culinary-as-a-Service model provides businesses and individuals with on-demand access to professional culinary expertise, from menu development to full-scale event catering, adapted to the modern economy.",
    },
    closing: "At Spice Krewe, we believe that technology shouldn't replace the chef—it should empower them. Our platform is built by culinary professionals, for culinary professionals, ensuring that innovation serves the craft rather than diminishing it.",
  };

  const displayContent = content || defaultContent;

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-spice-purple mb-4">
            About Spice Krewe: Hire Vetted Culinary Professionals
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-spice-purple border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">Our Story</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {displayContent.story}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our mission was simple: to foster meaningful connections through shared culinary experiences, celebrating culture, creativity, and community. What started as intimate dinners has grown into a thriving network of culinary professionals and enthusiasts.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, Spice Krewe continues to bring people together, creating opportunities for collaboration, learning, and growth within the culinary industry and beyond.
                </p>
                <div className="rounded-sk-md border border-sk-card-border bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-spice-purple mb-2">What the community says</p>
                  <p className="text-gray-700 italic leading-relaxed">
                    “People love our culinary services, and we love Spice Krewe Culinary.”
                  </p>
                  <p className="text-sm text-gray-500 mt-2">— Voice from our legacy marketplace pages, carried forward</p>
                </div>
              </div>

              <div className="relative flex justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-spice-purple to-spice-blue rounded-3xl transform rotate-3 opacity-20"></div>
                <div className="relative bg-white p-8 border border-sk-card-border rounded-sk-md shadow-2xl">
                  <img
                    src="/assets/brand/logo-primary.png"
                    alt="Spice Krewe — verified culinary talent network"
                    className="w-full h-auto max-w-md mx-auto"
                    loading="lazy"
                    decoding="async"
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

            <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <figure className="m-0 overflow-hidden rounded-sk-md border border-sk-card-border shadow-md bg-white">
                <img
                  src="/assets/images/heritage/crawfish-season.jpg"
                  alt="Crawfish season gathering"
                  className="w-full h-44 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="px-3 py-2 text-xs text-gray-600 text-center">Heritage: crawfish season</figcaption>
              </figure>
              <figure className="m-0 overflow-hidden rounded-sk-md border border-sk-card-border shadow-md bg-white">
                <img
                  src="/assets/images/heritage/crawfish-boil.jpg"
                  alt="Crawfish boil community moment"
                  className="w-full h-44 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="px-3 py-2 text-xs text-gray-600 text-center">Community boil</figcaption>
              </figure>
              <figure className="m-0 overflow-hidden rounded-sk-md border border-sk-card-border shadow-md bg-white">
                <img
                  src="/assets/images/heritage/community-moment.jpg"
                  alt="Spice Krewe community moment"
                  className="w-full h-44 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="px-3 py-2 text-xs text-gray-600 text-center">Krewe in the field</figcaption>
              </figure>
            </div>

            <div className="mb-20 bg-white p-10 border border-sk-card-border rounded-sk-md shadow-lg">
              <h3 className="text-3xl font-bold text-spice-purple mb-6 text-center">
                Our Vision: The Culinary Operating System
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {displayContent.vision} Our platform connects opportunity with talent, provides world-class culinary education, and reimagines how culinary services are delivered in the modern economy.
              </p>
            </div>

            <div className="mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Three Pillars</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-sk-md border border-sk-card-border border-t-4 border-t-spice-purple shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-spice-purple/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Briefcase className="text-spice-purple" size={32} aria-hidden />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Hire</h4>
                  <h5 className="text-lg font-semibold text-spice-purple mb-3 text-center">The Marketplace</h5>
                  <p className="text-gray-700 leading-relaxed">
                    {displayContent.pillars?.hire}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-sk-md border border-sk-card-border border-t-4 border-t-spice-blue shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-spice-blue/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <GraduationCap className="text-spice-blue" size={32} aria-hidden />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Learn</h4>
                  <h5 className="text-lg font-semibold text-spice-blue mb-3 text-center">The Academy</h5>
                  <p className="text-gray-700 leading-relaxed">
                    {displayContent.pillars?.learn}
                  </p>
                </div>

                <div className="bg-white p-8 rounded-sk-md border border-sk-card-border border-t-4 border-t-spice-purple shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-spice-purple/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <TrendingUp className="text-spice-purple" size={32} />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Evolve</h4>
                  <h5 className="text-lg font-semibold text-spice-purple mb-3 text-center">Culinary-as-a-Service</h5>
                  <p className="text-gray-700 leading-relaxed">
                    {displayContent.pillars?.evolve}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-spice-purple to-spice-blue p-10 border border-sk-card-border rounded-sk-md shadow-2xl text-white">
              <p className="text-xl leading-relaxed text-center max-w-4xl mx-auto">
                {displayContent.closing} We're not just building a business; we're nurturing a movement that celebrates culinary artistry while embracing the possibilities of tomorrow.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
