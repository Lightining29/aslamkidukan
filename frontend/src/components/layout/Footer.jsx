import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, MapPin, Phone, Instagram, Youtube, Sparkles,
  Truck, ShieldCheck, Leaf, Headphones, ArrowRight, CheckCircle2, Heart
} from 'lucide-react';
import { toastSuccess } from '../../utils/toast';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    toastSuccess('Discount Unlocked! 🎉', 'Use code AAAN10 for 10% OFF your first 3D Wall Sticker order.');
    setEmail('');
  };

  return (
    <footer id="contact" className="luxury-footer-root">
      
      {/* Top Feature Trust Badges Grid */}
      <div className="footer-trust-strip">
        <div className="container footer-trust-grid">
          
          <div className="trust-card-item">
            <div className="trust-icon-wrap emerald">
              <Truck size={22} />
            </div>
            <div>
              <strong>Fast Pan-India Delivery</strong>
              <span>Dispatched within 24 hours in rigid safety tubes</span>
            </div>
          </div>

          <div className="trust-card-item">
            <div className="trust-icon-wrap blue">
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong>100% Damage-Free Guarantee</strong>
              <span>Hassle-free replacement if transit damage occurs</span>
            </div>
          </div>

          <div className="trust-card-item">
            <div className="trust-icon-wrap amber">
              <Leaf size={22} />
            </div>
            <div>
              <strong>Eco-Friendly &amp; Residue-Free</strong>
              <span>Non-toxic acrylic adhesives safe for painted walls</span>
            </div>
          </div>

          <div className="trust-card-item">
            <div className="trust-icon-wrap violet">
              <Headphones size={22} />
            </div>
            <div>
              <strong>24/7 Dedicated Support</strong>
              <span>Direct WhatsApp &amp; phone assistance</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Body */}
      <div className="container footer-main-content">
        <div className="footer-grid">
          
          {/* Brand Info */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand-header">
              <div className="footer-brand-logo-icon">🌿</div>
              <div className="footer-brand-title">
                <strong>AAAN CART</strong>
                <span>3D Wall Decor &amp; Decals</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Transform your living spaces into breathtaking architectural galleries with India's most loved collection of 3D Wall Niches, Botanical Plants &amp; Multi-Layer Butterfly Stickers.
            </p>
            <div className="footer-social-row">
              <a
                href="https://www.instagram.com/afsha.reaz?utm_source=qr&igsh=eWNwNmNkaDdldHh0"
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-social-pill instagram"
                aria-label="Instagram"
              >
                <Instagram size={17} />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.youtube.com/@afsh_aenterprises"
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-social-pill youtube"
                aria-label="YouTube"
              >
                <Youtube size={17} />
                <span>YouTube</span>
              </a>
              <a
                href="https://wa.me/918073786650"
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-social-pill whatsapp"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 3D Catalog Quick Links */}
          <div className="footer-links-col">
            <h4>Explore 3D Art</h4>
            <a href="/?section=products-catalog-section#products-catalog-section">All 3D Stickers</a>
            <a href="/?section=products-catalog-section#products-catalog-section">Architectural Wall Niches</a>
            <a href="/?section=products-catalog-section#products-catalog-section">Botanical Plant Decals</a>
            <a href="/?section=products-catalog-section#products-catalog-section">3D Butterflies Sets</a>
            <a href="/?section=products-catalog-section#products-catalog-section">Living Room Spotlights</a>
          </div>

          {/* Customer Care Links */}
          <div className="footer-links-col">
            <h4>Customer Care</h4>
            <Link to="/account">Dashboard &amp; Live Tracking</Link>
            <Link to="/account/wishlist">Saved Wishlist</Link>
            <Link to="/cart">Active Cart &amp; Checkout</Link>
            <a href="#about">About AAAN Cart</a>
            <a href="tel:+918073786650">Direct Phone Assistance</a>
          </div>

          {/* Contact Details & VIP Newsletter */}
          <div className="footer-newsletter-col">
            <h4>Get Exclusive Offers</h4>
            <p className="newsletter-caption">Subscribe to unlock 10% instant discount on your first 3D wall art purchase.</p>
            
            <form className="footer-newsletter-box" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrap">
                <Mail size={16} className="newsletter-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="footer-subscribe-btn">
                <span>Unlock 10%</span>
                <ArrowRight size={15} />
              </button>
            </form>

            <div className="footer-contact-items-list">
              <div className="footer-contact-row">
                <Phone size={15} className="contact-accent-icon" />
                <span>+91 80 7378 6650 (Mon - Sat, 9 AM - 8 PM)</span>
              </div>
              <div className="footer-contact-row">
                <Mail size={15} className="contact-accent-icon" />
                <span>reazafsha0@gmail.com</span>
              </div>
              <div className="footer-contact-row">
                <MapPin size={15} className="contact-accent-icon" />
                <span>75 Raja Muthiah Rd, Periamet, Chennai (Opp. Nehru Stadium Main Gate)</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            © 2026 <strong>AAAN Cart Enterprises</strong>. Crafted with <span style={{ color: '#10B981' }}>💚</span> for elegant modern homes.
          </p>

          <div className="footer-payment-badges">
            <span className="pay-pill">⚡ UPI</span>
            <span className="pay-pill">RuPay</span>
            <span className="pay-pill">Visa / Master</span>
            <span className="pay-pill">NetBanking</span>
            <span className="pay-pill">Cash On Delivery</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
