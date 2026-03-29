import Navbar from '../components/Navigation';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO title="Contact – Spice Krewe" description="Send a message or join our newsletter." path="/contact" />
      <Navbar />
      <main className="flex-1">
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
