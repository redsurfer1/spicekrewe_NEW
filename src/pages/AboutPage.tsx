import Navbar from '../components/Navigation';
import About from '../components/About';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About SpiceKrewe | Memphis private chefs & food trucks"
        description="SpiceKrewe is Memphis's booking platform for private chefs and food trucks — verified pros, AI concierge, secure payment."
        path="/about"
        ogTitle="About SpiceKrewe | Memphis private chefs & food trucks"
        ogDescription="SpiceKrewe is Memphis's booking platform for private chefs and food trucks — verified pros, AI concierge, secure payment."
      />
      <Navbar />
      <About />
      <Footer />
    </div>
  );
}
