import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Truck, ShieldCheck, HeartHandshake, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../../api';
import ProductCard from '../../components/product/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './LocalSEO.css';

const CITY_DATA = {
  delhi: {
    name: 'Delhi',
    keywords: 'Best 3D wall stickers in Delhi, botanical wall decals Delhi, buy wall art Delhi NCR',
    title: 'Best 3D Wall Stickers in Delhi | Buy Wall Decals - AAAN Cart',
    description: 'Looking for the best 3D wall stickers in Delhi? Buy premium acrylic wall decals and botanical stickers from AAAN Cart. Enjoy free 24-hour delivery in Delhi NCR.',
    heading: 'Premium 3D Wall Stickers in Delhi',
    intro: 'AAAN Cart is Delhi\'s leading supplier of hyper-realistic 3D wall stickers and botanical decals. Whether you live in South Delhi, Dwarka, Connaught Place, or Rohini, we provide doorstep delivery within 24 hours. Our selection of acrylic wall niches and 3D butterflies are perfect for transforming your home.',
    deliveryInfo: 'Express 24-hour delivery across Delhi, Noida, Gurgaon, and Ghaziabad. Cash on delivery available.',
    testimonial: '“I ordered the 3D butterfly wall set from AAAN Cart. It was delivered to my house in Dwarka within 18 hours. Excellent quality and transformed my living room!” – Rajesh Kumar, Delhi',
    faqs: [
      { q: 'Do you offer same-day delivery in Delhi?', a: 'Yes, we offer same-day delivery in select areas of Delhi NCR if the order is placed before 11:00 AM.' },
      { q: 'Can I pay on delivery in Delhi?', a: 'Yes, Cash on Delivery (COD) is fully supported across all locations in Delhi.' }
    ]
  },
  mumbai: {
    name: 'Mumbai',
    keywords: '3D wall stickers Mumbai, buy botanical wall decals Mumbai, wall art online Mumbai',
    title: '3D Wall Stickers & Decals in Mumbai | AAAN Cart',
    description: 'Buy 3D wall stickers and decals in Mumbai. Choose from premium botanical, acrylic niches and butterfly wall art by AAAN Cart. Fast shipping across Mumbai.',
    heading: 'Best 3D Wall Stickers in Mumbai',
    intro: 'From Colaba to Borivali and Thane, Mumbai residents trust AAAN Cart for premium 3D optical illusion wall art and acrylic decals. Our residue-free stickers offer a luxury aesthetic in the comfort of your home.',
    deliveryInfo: 'Fast 2-day delivery across Mumbai, Thane, and Navi Mumbai. Secure online payments & COD.',
    testimonial: '“Living in Mumbai means compact apartments. These 3D wall niche stickers from AAAN Cart give an incredible illusion of depth!” – Priya Sharma, Mumbai',
    faqs: [
      { q: 'Where is your service center in Mumbai?', a: 'We handle all claims directly with free replacement services in Mumbai.' },
      { q: 'Is delivery free in Mumbai?', a: 'Yes, we provide free shipping on all orders above ₹499 in Mumbai.' }
    ]
  },
  bangalore: {
    name: 'Bangalore',
    keywords: '3D wall art online Bangalore, botanical plant decals Bangalore, acrylic wall niches Bangalore',
    title: '3D Wall Stickers Online in Bangalore | AAAN Cart',
    description: 'Purchase 3D botanical wall stickers and acrylic decals online in Bangalore. Quick local shipping across Bangalore.',
    heading: 'Premium 3D Wall Decor in Bangalore',
    intro: 'AAAN Cart offers state-of-the-art 3D wall stickers and botanical decals in Bangalore. Ideal for modern apartments in Whitefield, Electronic City, and Indiranagar.',
    deliveryInfo: 'Super-fast shipping to Bangalore (2-3 days). Professional local customer support available.',
    testimonial: '“The acrylic wall niche stickers from AAAN Cart look unbelievable on my living room wall. Best decor purchase this year!” – Amit Patel, Bangalore',
    faqs: [
      { q: 'How long does shipping take to Bangalore?', a: 'Standard delivery takes 48 to 72 hours. Tracking link will be sent via SMS/Email.' },
      { q: 'Do the decals leave any residue?', a: 'No, all our 3D wall decals use paint-safe residue-free adhesive.' }
    ]
  }
};

export default function LocalSEO() {
  const { city } = useParams();
  const cityKey = city ? city.toLowerCase() : 'delhi';
  const data = CITY_DATA[cityKey] || CITY_DATA.delhi;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts({ limit: '4' })
      .then((res) => {
        if (mounted && Array.isArray(res)) {
          setProducts(res);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [cityKey]);

  const pageUrl = `https://aaancart.com/locations/${cityKey}`;

  // Structured Data
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': `AAAN Cart - 3D Wall Stickers in ${data.name}`,
    'image': 'https://aaancart.com/favicon.svg',
    'telephone': '+91 80737 86650',
    'url': pageUrl,
    'priceRange': '₹₹',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': data.name,
      'addressCountry': 'IN'
    },
    'description': data.description,
    'brand': {
      '@type': 'Brand',
      'name': 'AAAN Cart'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://aaancart.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': `3D Wall Stickers in ${data.name}`,
        'item': pageUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <meta name="keywords" content={data.keywords} />
        <link rel="canonical" href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://www.afshaenterprises.com/masage.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Navbar />

      <div className="local-seo-page">
        <div className="container">
          {/* Breadcrumb Navigation */}
          <nav className="breadcrumb" aria-label="breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span className="current">Body Massager in {data.name}</span>
          </nav>

          <div className="local-hero">
            <div className="local-hero-content">
              <span className="local-badge"><MapPin size={16} /> Certified Local Partner</span>
              <h1 className="local-title">{data.heading}</h1>
              <p className="local-intro">{data.intro}</p>
              <div className="local-features">
                <div className="local-feature-item">
                  <Truck className="feature-icon" />
                  <div>
                    <h4>Express Shipping</h4>
                    <p>{data.deliveryInfo}</p>
                  </div>
                </div>
                <div className="local-feature-item">
                  <ShieldCheck className="feature-icon" />
                  <div>
                    <h4>1-Year Warranty</h4>
                    <p>Free home pickup and replacement services for all orders.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="local-hero-image">
              <img src="/masage.jpg" alt={`Body Massagers in ${data.name}`} className="hero-img-element" />
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="local-products-section">
            <h2 className="section-title text-center">Top Massagers Recommended for You</h2>
            <p className="section-subtitle text-center">Highly rated electric body massagers available with instant dispatch.</p>

            {loading ? (
              <div className="local-loading">
                <div className="loading-spinner" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-center">No products available in this location currently.</p>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Localized Testimonial */}
          <div className="local-testimonial">
            <HeartHandshake size={32} className="testimonial-decor" />
            <p className="testimonial-text">{data.testimonial}</p>
            <span className="testimonial-author">— Verified Buyer</span>
          </div>

          {/* Local FAQ Section */}
          <div className="local-faq">
            <h2 className="section-title text-center">Frequently Asked Questions</h2>
            <div className="faq-grid">
              {data.faqs.map((faq, idx) => (
                <div key={idx} className="faq-card">
                  <h4 className="faq-question">Q: {faq.q}</h4>
                  <p className="faq-answer">{faq.a}</p>
                </div>
              ))}
              <div className="faq-card">
                <h4 className="faq-question">Q: How do I claim warranty for Afsha Enterprises products?</h4>
                <p className="faq-answer">Simply contact our customer support via phone or email. We will arrange a free reverse pickup from your home address, inspect the device, and send a brand-new replacement.</p>
              </div>
              <div className="faq-card">
                <h4 className="faq-question">Q: What types of massagers do you offer?</h4>
                <p className="faq-answer">We offer a wide range of electric body massagers, including handheld percussion massagers, deep tissue massagers, neck and shoulder kneading massagers, and foot massager machines.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
