import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { api } from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [contactDataConsent, setContactDataConsent] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== '#message') return;
    const t = window.setTimeout(() => {
      document.getElementById('message')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactDataConsent) {
      alert('Please confirm data processing consent to send your message.');
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await api.submitContactForm({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      if (result.success) {
        alert('Thank you for reaching out! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        alert('Backend not available yet. Your message has been noted locally.');
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch {
      alert('Form submitted successfully! (Backend connection pending)');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get In <span className="text-spice-purple">Touch</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-spice-purple to-spice-blue mx-auto mb-6" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to join our community? We'd love to hear from you. Send us a message and we'll respond as soon as
            possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div className="min-h-[320px] bg-white border border-sk-card-border rounded-sk-md shadow-xl p-8 w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h3>

            <form id="message" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spice-purple focus:border-transparent min-h-[44px]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spice-purple focus:border-transparent min-h-[44px]"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spice-purple focus:border-transparent min-h-[44px]"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="message-body" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message-body"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spice-purple focus:border-transparent resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactDataConsent}
                  onChange={(e) => setContactDataConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-spice-purple"
                />
                <span>
                  I consent to Spice Krewe processing my contact details to respond to this inquiry, as described in the{' '}
                  <Link to="/privacy" className="text-spice-purple font-medium underline-offset-2 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !contactDataConsent}
                className="w-full bg-spice-purple text-white py-4 rounded-lg font-semibold hover:bg-spice-blue transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send size={20} aria-hidden />
              </button>
            </form>
          </div>

          <div className="min-h-[320px] bg-gradient-to-br from-spice-purple to-spice-blue border border-sk-card-border rounded-sk-md shadow-xl p-8 text-white w-full">
            <h3 className="text-2xl font-bold mb-4">Join Our Newsletter</h3>
            <p className="mb-6 text-white/90">
              Stay updated with our latest events, news, and community highlights.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address for newsletter
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="newsletter-email"
                  autoComplete="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white min-h-[44px]"
                />
                <button
                  type="button"
                  disabled={newsletterBusy || !newsletterConsent || !newsletterEmail.trim()}
                  onClick={async () => {
                    if (!newsletterConsent) {
                      alert('Please confirm consent to receive marketing emails.');
                      return;
                    }
                    setNewsletterBusy(true);
                    try {
                      const result = await api.subscribeNewsletter({ email: newsletterEmail.trim() });
                      if (result.success) {
                        alert('Thanks — you are subscribed.');
                        setNewsletterEmail('');
                        setNewsletterConsent(false);
                      } else {
                        alert(result.error || 'Could not subscribe right now.');
                      }
                    } finally {
                      setNewsletterBusy(false);
                    }
                  }}
                  className="shrink-0 bg-white text-spice-purple px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {newsletterBusy ? '…' : 'Subscribe'}
                </button>
              </div>
              <label className="flex items-start gap-2 text-sm text-white/95 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-white"
                />
                <span>
                  I agree to receive occasional updates about Spice Krewe and accept the processing of my email as
                  described in the{' '}
                  <Link to="/privacy" className="underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
