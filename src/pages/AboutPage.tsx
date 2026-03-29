import Navbar from '../components/Navigation';
import About from '../components/About';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Spice Krewe | Spice Krewe"
        description="Our story, pillars, and how the Krewe supports culinary professionals and enterprise food teams."
        path="/about"
        ogTitle="About Spice Krewe | Spice Krewe"
        ogDescription="Our story, pillars, and how the Krewe supports culinary professionals and enterprise food teams."
      />
      <Navbar />
      <About />
      <Footer />
    </div>
  );
}
