import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, Home, ShoppingBag, MessageSquare } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import './NotFound.css';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found | AAAN Cart</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <div className="not-found-page">
        <div className="container text-center">
          <div className="icon-box">
            <ShieldAlert size={64} className="text-rose-500 animate-bounce" />
          </div>
          <h1 className="not-found-title">404</h1>
          <p className="not-found-text">
            Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="quick-links">
            <Link to="/" className="btn btn-sky flex items-center justify-center gap-2">
              <Home size={18} /> Back to Home
            </Link>
            <Link to="/contact" className="btn btn-outline flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Contact Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
