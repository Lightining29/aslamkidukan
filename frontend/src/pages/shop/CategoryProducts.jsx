import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { fetchProducts, fetchCategories, fetchCategory } from '../../api';
import ProductCard from '../../components/product/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import '../../components/shop/Bestsellers.css';
import './CategoryProducts.css';

export default function CategoryProducts() {
  const { categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryObj, setCategoryObj] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        let cat = null;
        // Check if categorySlug is a 24-character hex ObjectId
        if (categorySlug && categorySlug.match(/^[0-9a-fA-F]{24}$/)) {
          const cats = await fetchCategories();
          cat = (Array.isArray(cats) ? cats : []).find((c) => c._id === categorySlug);
        } else if (categorySlug) {
          cat = await fetchCategory(categorySlug);
        }

        if (!mounted) return;

        if (cat) {
          setCategoryObj(cat);
          setCategoryName(cat.name);
          const data = await fetchProducts({ category: cat._id });
          if (mounted && Array.isArray(data)) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.error('Failed to load category data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [categorySlug]);

  const canonicalUrl = `https://aaancart.com/category/${categoryObj?.slug || categorySlug}`;

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
        'name': categoryName || 'Category',
        'item': canonicalUrl
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{categoryName ? `${categoryName} | AAAN Cart` : 'Shop Category | AAAN Cart'}</title>
        <meta name="description" content={`Explore our premium range of ${categoryName || '3D Wall Art'} products. High-quality 3D wall stickers, acrylic decals, and wall decor with quick delivery in India.`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={categoryName ? `${categoryName} | AAAN Cart` : 'Shop Category'} />
        <meta property="og:description" content={`Explore our premium range of ${categoryName || '3D Wall Art'} products.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Navbar />
      <div className="category-products-page">
        <div className="container">
          <Link to="/" className="back-link">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <div className="category-products-header">
            <div>
              <p className="section-label">Category</p>
              <h1 className="section-title category-products-title">
                {categoryName || 'Products'}
              </h1>
            </div>
            <span className="category-products-count">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          {loading ? (
            <div className="category-products-loading">
              <div className="loading-spinner" />
            </div>
          ) : products.length === 0 ? (
            <div className="category-products-empty">
              <h3>No products found</h3>
              <p>There are no products in this category yet.</p>
              <Link to="/" className="btn btn-sky">← Browse All Products</Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
