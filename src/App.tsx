import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Events from './components/Events';
import ProductGrid from './components/ProductGrid';
import KreweMap from './components/KreweMap';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SEO from './components/SEO';
import OGBanner from './components/OGBanner';

function App() {
  // Temporary route for OG banner generation (remove after saving og-image.png)
  // if (window.location.pathname === '/og-banner') {
  //   return <OGBanner />;
  // }

  return (
    <div className="min-h-screen bg-white">
      <SEO />
      <Navigation />
      <Hero />
      <About />
      <Events />
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-spice-purple">Products</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our spice blends and single-origin spices. Search by name to find your favorite.
            </p>
          </div>
          <ProductGrid />
        </div>
      </section>
      <section id="find-us" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Find <span className="text-spice-purple">Spice Krewe</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visit us at one of our locations. Click a marker for details.
            </p>
          </div>
          <KreweMap />
        </div>
      </section>
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
