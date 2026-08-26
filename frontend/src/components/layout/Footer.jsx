import { Link } from 'react-router-dom';
import {
  Mail, MapPin, Phone, Instagram, Youtube,
  Truck, ShieldCheck, Leaf, Headphones, Heart
} from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer id="contact" className="webapp-light-footer">
      
      {/* Compact Trust Features Strip */}
      <div className="light-footer-trust-strip">
        <div className="container light-trust-grid">
          
          <div className="light-trust-pill">
            <Truck size={17} className="trust-pill-icon emerald" />
            <span>Fast 24h Dispatch</span>
          </div>

          <div className="light-trust-pill">
            <ShieldCheck size={17} className="trust-pill-icon blue" />
            <span>30-Day Guarantee</span>
          </div>

          <div className="light-trust-pill">
            <Leaf size={17} className="trust-pill-icon amber" />
            <span>Residue-Free 3D Decals</span>
          </div>

          <div className="light-trust-pill">
            <Headphones size={17} className="trust-pill-icon purple" />
            <span>24/7 Live Support</span>
          </div>

        </div>
      </div>

      {/* Main Compact Body */}
      <div className="container light-footer-content">
        <div className="light-footer-grid">
          
          {/* Brand Col */}
          <div className="light-footer-brand-col">
            <Link to="/" className="light-footer-brand-head">
              <span className="brand-leaf-icon">🌿</span>
              <div className="brand-text-wrap">
                <strong>AAAN CART</strong>
                <span>3D Wall Art &amp; Decals</span>
              </div>
            </Link>
            <p className="light-footer-desc">
              India's favorite botanical stickers, acrylic wall niches &amp; 3D butterfly wall decor for modern homes.
            </p>
            
            {/* Social Pills */}
            <div className="light-social-row">
              <a
                href="https://www.instagram.com/afsha.reaz"
                target="_blank"
                rel="noopener noreferrer"
                className="light-social-btn insta"
                aria-label="Instagram"
              >
                <Instagram size={15} />
                <span>Instagram</span>
              </a>
              <a
                href="https://wa.me/918073786650"
                target="_blank"
                rel="noopener noreferrer"
                className="light-social-btn wa"
                aria-label="WhatsApp"
              >
                <Phone size={15} />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://www.youtube.com/@afsh_aenterprises"
                target="_blank"
                rel="noopener noreferrer"
                className="light-social-btn yt"
                aria-label="YouTube"
              >
                <Youtube size={15} />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="light-footer-links-col">
            <h5>Explore Decals</h5>
            <Link to="/shop">All 3D Wall Stickers</Link>
            <Link to="/categories">Botanical Plants</Link>
            <Link to="/shop">Wall Niches</Link>
            <Link to="/shop">3D Butterflies</Link>
          </div>

          {/* Account & Help */}
          <div className="light-footer-links-col">
            <h5>Customer Hub</h5>
            <Link to="/account">My Orders</Link>
            <Link to="/account/wishlist">Saved Wishlist</Link>
            <Link to="/contact">Contact Support</Link>
            <Link to="/privacy">Privacy &amp; Terms</Link>
          </div>

          {/* Contact Details */}
          <div className="light-footer-contact-col">
            <h5>Store Support</h5>
            <div className="light-contact-row">
              <Phone size={14} className="contact-icon" />
              <span>+91 80 7378 6650 (Mon - Sat)</span>
            </div>
            <div className="light-contact-row">
              <Mail size={14} className="contact-icon" />
              <span>reazafsha0@gmail.com</span>
            </div>
            <div className="light-contact-row">
              <MapPin size={14} className="contact-icon" />
              <span>75 Raja Muthiah Rd, Chennai 600003</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="light-footer-bottom-bar">
        <div className="container light-bottom-inner">
          <p className="light-copyright">
            © 2026 <strong>AAAN Cart Enterprises</strong>. Crafted with <span style={{ color: '#10B981' }}>💚</span> in India.
          </p>

          <div className="light-pay-pills-row">
            <span className="pay-tag">⚡ Instant UPI</span>
            <span className="pay-tag">RuPay</span>
            <span className="pay-tag">Cards</span>
            <span className="pay-tag">NetBanking</span>
            <span className="pay-tag">Cash On Delivery</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
