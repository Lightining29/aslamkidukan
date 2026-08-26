import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, Sparkles, Search, SlidersHorizontal, ArrowLeft, Grid3X3, Grid2X2 } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../../api';
import ProductCard from '../../components/product/ProductCard';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import './ShopCatalogPage.css';

export default function ShopCatalogPage() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState(params.get('search') || '');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(2); // 2 or 3 columns

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([fetchProducts(), fetchCategories()])
      .then(([prodsData, catsData]) => {
        if (!isMounted) return;
        setProducts(Array.isArray(prodsData) ? prodsData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    if (catSlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', catSlug);
    }
    setParams(params);
  };

  // Filter products by Category & Search
  const filteredProducts = products.filter((item) => {
    // Match Category
    if (selectedCategory !== 'all') {
      const matchCat =
        item.category?.slug === selectedCategory ||
        item.category?._id === selectedCategory ||
        item.category === selectedCategory ||
        item.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }

    // Match Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }

    return true;
  });

  // Sort Products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    return 0; // Default popular
  });

  return (
    <>
      <Helmet>
        <title>All 3D Wall Stickers &amp; Botanical Decals | AAAN Cart</title>
        <meta
          name="description"
          content="Shop India's most loved 3D Wall Stickers, Acrylic Niches, and Botanical Plant Decals with easy residue-free adhesive."
        />
      </Helmet>

      <Navbar />

      <div className="shop-catalog-page-wrapper">
        
        {/* Top Header Banner */}
        <div className="shop-catalog-hero">
          <div className="container hero-inner-box">
            <div className="shop-hero-badge">
              <Sparkles size={15} color="#FFE600" />
              <span>OFFICIAL 3D WALL ART CATALOG</span>
            </div>
            <h1 className="shop-hero-title">Explore All 3D Stickers</h1>
            <p className="shop-hero-subtitle">
              Residue-free acrylic adhesives, multi-layered 3D niches, and vibrant botanical wall art for your home.
            </p>

            {/* Instant Search Bar */}
            <div className="shop-search-bar-wrap">
              <Search size={18} className="shop-search-icon" />
              <input
                type="text"
                placeholder="Search 3D niches, butterflies, plants, decals…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
          </div>
        </div>

        <div className="container shop-main-layout">
          
          {/* Category Filter Pills Bar */}
          <div className="shop-category-pills-bar">
            <button
              className={`cat-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              🌿 All 3D Stickers ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id || cat.slug}
                className={`cat-pill-btn ${selectedCategory === (cat.slug || cat._id) ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.slug || cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Controls Bar (Item count, Sort selector) */}
          <div className="shop-controls-bar">
            <div className="results-count-text">
              Showing <strong>{sortedProducts.length}</strong> beautiful designs
            </div>

            <div className="shop-right-filters">
              <div className="sort-select-wrapper">
                <SlidersHorizontal size={15} color="#64748B" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="shop-loading-state">
              <div className="loading-spinner" />
              <p>Loading 3D Wall Art Catalog…</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="shop-empty-state">
              <span style={{ fontSize: '3rem' }}>🌿</span>
              <h3>No 3D Stickers Found</h3>
              <p>Try searching for a different keyword or view all categories.</p>
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                View All 3D Stickers
              </button>
            </div>
          ) : (
            <div className={`shop-products-grid cols-${gridCols}`}>
              {sortedProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}

        </div>

      </div>

      <Footer />
    </>
  );
}
