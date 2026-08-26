import { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  MessageSquare,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { submitContact } from '../api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { toastSuccess, toastError } from '../utils/toast.js';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order & Tracking Inquiry',
    message: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const topicPills = [
    { label: '📦 Order & Tracking', val: 'Order & Tracking Inquiry' },
    { label: '🌿 Custom 3D Wall Stickers', val: 'Custom 3D Decal Dimensions' },
    { label: '💼 Bulk & Wholesale', val: 'Bulk Wholesale Quotation' },
    { label: '🔄 Returns & Refund', val: 'Return or Replacement Request' },
    { label: '💬 General Inquiry', val: 'General Store Inquiry' }
  ];

  const faqs = [
    {
      q: 'How long does delivery take for 3D Wall Stickers?',
      a: 'Orders are dispatched within 24 hours. Metro deliveries typically arrive in 2–4 business days, while other locations take 4–6 business days.'
    },
    {
      q: 'Are your 3D Wall Decals removable and reusable?',
      a: 'Yes! All AAAN 3D Wall Decals & Acrylic Niches use premium residue-free adhesive backing that safely removes without damaging wall paint.'
    },
    {
      q: 'What is your return & replacement policy?',
      a: 'We offer a 30-day hassle-free doorstep replacement or full refund if your product arrives damaged or does not match your room.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is available across 26,000+ PIN codes across India with zero extra charges.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toastError('Missing Fields', 'Please fill in your name, email, and message.');
    }
    setSaving(true);
    try {
      await submitContact(form);
      toastSuccess('Ticket Dispatched! 📩', "We've received your request and will reply within 2-4 hours.");
      setForm({ name: '', email: '', phone: '', subject: 'Order & Tracking Inquiry', message: '' });
    } catch {
      toastError('Submission Error', 'Failed to send message. Please try WhatsApp support below.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="contact-webapp-page">
        
        {/* Web App Hero Header */}
        <div className="contact-hero-banner">
          <div className="contact-hero-badge">
            <Sparkles size={16} color="#FFE600" />
            <span>24/7 CUSTOMER CARE &amp; SUPPORT</span>
          </div>

          <h1 className="contact-hero-title">How can we help you today?</h1>
          <p className="contact-hero-subtitle">
            Reach our verified support team for questions regarding your orders, custom 3D wall dimensions, or doorstep replacement.
          </p>

          {/* Quick Action Floating Pills */}
          <div className="contact-quick-pills-row">
            <a href="tel:+918073786650" className="quick-pill-btn">
              <Phone size={15} color="#10B981" />
              <span>+91 80737 86650</span>
            </a>
            
            <a
              href="https://wa.me/918073786650?text=Hi%20AAAN%20Cart,%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noreferrer"
              className="quick-pill-btn whatsapp-pill"
            >
              <MessageSquare size={15} color="#25D366" />
              <span>WhatsApp Live Chat</span>
            </a>

            <a href="mailto:reazafsha0@gmail.com" className="quick-pill-btn">
              <Mail size={15} color="#0066FF" />
              <span>reazafsha0@gmail.com</span>
            </a>
          </div>
        </div>

        <div className="contact-main-grid-container">
          
          {/* Left: Modern Web App Contact Form */}
          <div className="contact-card-surface form-card">
            <div className="card-head-bar">
              <div className="card-head-title">
                <Send size={18} color="#0066FF" />
                <h3>Send a Priority Message</h3>
              </div>
              <span className="priority-tag">Fast Reply: ~2 hrs</span>
            </div>

            <form onSubmit={handleSubmit} className="webapp-contact-form">
              
              {/* Topic Selector Pills */}
              <div className="topic-selector-block">
                <label className="form-field-label">Select Inquiry Topic</label>
                <div className="topic-pills-wrap">
                  {topicPills.map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      className={`topic-pill ${form.subject === t.val ? 'selected' : ''}`}
                      onClick={() => setForm((p) => ({ ...p, subject: t.val }))}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="form-field-group">
                  <label className="form-field-label">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Manish Kumar"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-field-label">Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Phone / WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className="form-field-group">
                <label className="form-field-label">Your Message or Order Query *</label>
                <textarea
                  rows={4}
                  placeholder="Describe your inquiry or mention your Order ID..."
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="btn-webapp-submit" disabled={saving}>
                {saving ? 'Sending…' : (<><Send size={16} /> Dispatch Priority Inquiry</>)}
              </button>
            </form>
          </div>

          {/* Right: Store Headquarters & Map Card */}
          <div className="contact-card-surface info-card">
            
            <div className="card-head-bar">
              <div className="card-head-title">
                <MapPin size={18} color="#10B981" />
                <h3>Store Headquarters</h3>
              </div>
              <span className="verified-store-tag">
                <ShieldCheck size={14} /> Verified Business
              </span>
            </div>

            <div className="store-address-box">
              <strong className="company-title">AAAN ENTERPRISES PVT. LTD.</strong>
              <p className="address-line">
                📍 75 Raja Muthiah Road, Periamet, Opposite Nehru Stadium Main Gate, Chennai, Tamil Nadu - 600003
              </p>
              <p className="gst-line">GSTIN: 27AAACA9841A1Z5 | PAN: AAACA9841A</p>

              <a
                href="https://maps.google.com/?q=75+Raja+muthiah+road+periamet+nehru+stadium+chennai"
                target="_blank"
                rel="noreferrer"
                className="btn-store-map"
              >
                <Navigation size={15} /> Open in Google Maps
              </a>
            </div>

            <div className="store-meta-features">
              <div className="meta-feature-row">
                <div className="feature-icon-badge"><Clock size={16} color="#0066FF" /></div>
                <div>
                  <strong>Business Hours</strong>
                  <p>Mon – Sat: 9:00 AM – 8:00 PM (IST)</p>
                </div>
              </div>

              <div className="meta-feature-row">
                <div className="feature-icon-badge"><CheckCircle2 size={16} color="#10B981" /></div>
                <div>
                  <strong>30-Day Easy Returns</strong>
                  <p>Instant doorstep pickup across India</p>
                </div>
              </div>
            </div>

            <div className="instant-whatsapp-card">
              <div className="wa-card-left">
                <MessageSquare size={24} color="#25D366" />
                <div>
                  <strong>Need Urgent Help?</strong>
                  <p>Chat directly with our fulfillment manager on WhatsApp.</p>
                </div>
              </div>
              <a
                href="https://wa.me/918073786650?text=Hi%20AAAN%20Cart,%20I%20need%20urgent%20help%20with%20my%20order"
                target="_blank"
                rel="noreferrer"
                className="btn-wa-direct"
              >
                WhatsApp Us &rsaquo;
              </a>
            </div>

          </div>

        </div>

        {/* Bottom: FAQ Accordion Section */}
        <div className="contact-faq-section">
          <div className="faq-head">
            <HelpCircle size={22} color="#0066FF" />
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`faq-card ${activeFaq === i ? 'is-open' : ''}`}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="faq-question-row">
                  <strong>{f.q}</strong>
                  <ChevronDown size={18} className="faq-chevron" />
                </div>
                {activeFaq === i && (
                  <p className="faq-answer-text">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
