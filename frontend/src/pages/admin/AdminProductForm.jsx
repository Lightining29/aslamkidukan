import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ImagePlus, Sparkles, RefreshCw, ShieldCheck, Truck, Check, Eye, Tag, DollarSign, Wand2 } from 'lucide-react';
import { fetchAdminCategories, createProduct, updateProduct, fetchAdminProducts, formatPrice } from '../../api';
import AaanLogo from '../../components/common/AaanLogo';
import AdminAiGenerator from './AdminAiGenerator';
import { toastSuccess } from '../../utils/toast.js';
import '../../styles/Panel.css';
import '../auth/Auth.css';
import './AdminProductForm.css';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  price: '',
  originalPrice: '',
  category: '',
  dimensions: '',
  stockQuantity: 50,
  discountPercent: 0,
  bestseller: false,
  warranty: '1 Year AAAN Official Warranty',
  shippingType: 'Free Express Shipping',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ ...emptyForm, sizes: [] });
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [originalUrls, setOriginalUrls] = useState([]);
  const [removedIndices, setRemovedIndices] = useState(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showImageEnhancerModal, setShowImageEnhancerModal] = useState(false);

  // Category detection
  const selectedCatObj = categories.find((c) => c._id === form.category);
  const catName = (selectedCatObj?.name || '').toLowerCase();

  const isClothing = catName.includes('cloth') || catName.includes('fashion') || catName.includes('apparel') || catName.includes('wear') || catName.includes('shirt') || catName.includes('pant') || catName.includes('dress');
  const isFurnitureOrElectronics = catName.includes('furniture') || catName.includes('electron') || catName.includes('tech') || catName.includes('home') || catName.includes('appliance') || catName.includes('living') || catName.includes('wellness');

  const generateSku = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const prefix = isClothing ? 'AAAN-CLT' : isFurnitureOrElectronics ? 'AAAN-TEC' : 'AAAN-CAT';
    const sku = `${prefix}-${randomCode}`;
    setForm((prev) => ({ ...prev, sku }));
    toastSuccess('SKU Generated', `Assigned code ${sku}`);
  };

  const toggleSize = (sz) => {
    setForm((prev) => {
      const current = prev.sizes || [];
      if (current.includes(sz)) {
        return { ...prev, sizes: current.filter((s) => s !== sz) };
      }
      return { ...prev, sizes: [...current, sz] };
    });
  };

  const addCustomSize = () => {
    const s = customSizeInput.trim();
    if (!s) return;
    setForm((prev) => {
      const current = prev.sizes || [];
      if (!current.includes(s)) {
        return { ...prev, sizes: [...current, s] };
      }
      return prev;
    });
    setCustomSizeInput('');
  };

  const keptOriginals = originalUrls
    .map((url, i) => ({ url, originalIndex: i }))
    .filter((entry) => !removedIndices.has(entry.originalIndex));

  const previews = [
    ...keptOriginals.map((entry) => ({ url: entry.url, isExisting: true, originalIndex: entry.originalIndex })),
    ...newFiles.map((file) => ({ url: URL.createObjectURL(file), isExisting: false, file })),
  ];
  const totalCount = previews.length;

  useEffect(() => {
    fetchAdminCategories().then(setCategories);
    if (isEdit) {
      fetchAdminProducts().then((products) => {
        const p = products.find((x) => x._id === id);
        if (p) {
          setForm({
            name: p.name,
            sku: p.sku || `AAAN-CAT-${Math.floor(1000 + Math.random() * 9000)}`,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice || '',
            category: p.category?._id || p.category,
            dimensions: p.dimensions || '',
            stockQuantity: p.stockQuantity,
            discountPercent: p.discountPercent || 0,
            bestseller: p.bestseller || false,
            warranty: p.warranty || '1 Year AAAN Official Warranty',
            shippingType: p.shippingType || 'Free Express Shipping',
            sizes: p.sizes || []
          });
          const imgs = Array.isArray(p.images) ? p.images : [];
          setOriginalUrls(imgs.length > 0 ? imgs : p.image ? [p.image] : []);
        }
      });
    } else {
      generateSku();
    }
  }, [id, isEdit]);

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    setError('');
    setNewFiles((prev) => {
      const room = MAX_IMAGES - keptOriginals.length - prev.length;
      if (room <= 0) {
        setError(`Maximum ${MAX_IMAGES} images allowed per catalog item.`);
        return prev;
      }
      const accepted = [];
      for (const f of incoming) {
        if (accepted.length >= room) {
          setError(`Only ${room} more image${room === 1 ? '' : 's'} can be added.`);
          break;
        }
        if (f.size > MAX_FILE_SIZE) {
          setError(`${f.name} exceeds 5 MB limit.`);
          continue;
        }
        accepted.push(f);
      }
      return [...prev, ...accepted];
    });
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removePreview = (idx) => {
    const target = previews[idx];
    if (!target) return;
    if (target.isExisting) {
      setRemovedIndices((prev) => new Set(prev).add(target.originalIndex));
    } else {
      setNewFiles((prev) => prev.filter((_, i) => i !== idx - keptOriginals.length));
    }
  };

  const calculateDiscountInfo = () => {
    const curr = parseFloat(form.price) || 0;
    const orig = parseFloat(form.originalPrice) || 0;
    if (orig > curr && curr > 0) {
      const saveAmt = orig - curr;
      const pct = Math.round((saveAmt / orig) * 100);
      return { saveAmt, pct };
    }
    return null;
  };

  const discountInfo = calculateDiscountInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (totalCount === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    setLoading(true);
    try {
      const fields = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : '',
        stockQuantity: parseInt(form.stockQuantity, 10),
        discountPercent: discountInfo ? discountInfo.pct : (parseInt(form.discountPercent, 10) || 0),
        bestseller: form.bestseller,
      };

      if (isEdit) {
        const hasNew = newFiles.length > 0;
        const opts = hasNew ? {} : { deleteIndices: [...removedIndices] };
        await updateProduct(id, fields, newFiles, opts);
        toastSuccess('Catalog Updated!', `${form.name} updated successfully.`);
      } else {
        await createProduct(fields, newFiles);
        toastSuccess('Catalog Published!', `${form.name} is now live on AAAN Storefront.`);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAiContent = (aiData) => {
    setForm((prev) => ({
      ...prev,
      description: (aiData.professionalDescription || '') + '\n\n' + (Array.isArray(aiData.bulletPoints) ? aiData.bulletPoints.join('\n') : '')
    }));
    setShowAiModal(false);
    toastSuccess('AI Copy Applied!', 'Product description & bullet points updated.');
  };

  const handleApplyEnhancedImage = (enhancedFile) => {
    setNewFiles((prev) => [enhancedFile, ...prev]);
    setShowImageEnhancerModal(false);
    toastSuccess('Enhanced Image Added!', 'AI WebP photo added to gallery.');
  };

  return (
    <div className="aaan-catalog-creator-shell">
      {/* Luxury Hero Banner */}
      <div className="catalog-creator-hero">
        <div>
          <div className="hero-hub-badge">
            <AaanLogo size="sm" />
            <span>AAAN Catalog Studio</span>
          </div>
          <h2>{isEdit ? '✏️ Edit Catalog Item' : '✨ Add New Product Catalog'}</h2>
          <p>Create luxury product listings with automated size pickers, price calculators &amp; real-time preview.</p>
        </div>
        <div className="hero-quick-stats" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-ai-modal-trigger"
            onClick={() => setShowImageEnhancerModal(true)}
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
          >
            🎨 AI Image Studio
          </button>
          <button
            type="button"
            className="btn-ai-modal-trigger"
            onClick={() => setShowAiModal(true)}
          >
            <Sparkles size={16} /> AI Copy Generator
          </button>
          <div className="stat-pill">
            <span>SKU Code</span>
            <strong>{form.sku || 'AAAN-CAT-1001'}</strong>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="catalog-form-grid">
        {error && <div className="auth-error" style={{ gridColumn: '1 / -1' }}>{error}</div>}

        {/* Left Column — Form Control Cards */}
        <div className="catalog-form-main">
          
          {/* Card 1: Basic Info */}
          <div className="apf-card">
            <div className="card-head-between">
              <h3 className="card-title">📦 Basic Product Information</h3>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  color: '#4F46E5',
                  border: '1px solid #C7D2FE',
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} /> ✨ Auto-Generate Copy with AI
              </button>
            </div>
            
            <div className="apf-group">
              <label>Catalog Product Name *</label>
              <input
                value={form.name}
                onChange={update('name')}
                required
                placeholder="e.g. AAAN Luxury Silk Saree or Ultra Smart Watch"
                className="apf-input-lg"
              />
            </div>

            <div className="apf-row-2">
              <div className="apf-group">
                <label>Category *</label>
                <select value={form.category} onChange={update('category')} required className="apf-select">
                  <option value="">Select product category…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="apf-group">
                <label>SKU Code</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={form.sku} onChange={update('sku')} placeholder="AAAN-CAT-1001" />
                  <button type="button" onClick={generateSku} className="btn-sku-gen" title="Generate SKU">
                    <Wand2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="apf-group">
              <label>Detailed Description *</label>
              <textarea
                value={form.description}
                onChange={update('description')}
                required
                rows={4}
                placeholder="Describe product highlights, materials, features &amp; package contents…"
              />
            </div>
          </div>

          {/* Card 2: Pricing & Discount Calculator */}
          <div className="apf-card">
            <h3 className="card-title">💰 Pricing &amp; Savings Calculator</h3>
            
            <div className="apf-row-3">
              <div className="apf-group">
                <label>Offer Price (₹) *</label>
                <input type="number" step="1" min="0" value={form.price} onChange={update('price')} required placeholder="e.g. 1999" />
              </div>

              <div className="apf-group">
                <label>Original MRP Price (₹)</label>
                <input type="number" step="1" min="0" value={form.originalPrice} onChange={update('originalPrice')} placeholder="e.g. 2999" />
              </div>

              <div className="apf-group">
                <label>Stock Quantity (Units)</label>
                <input type="number" min="0" value={form.stockQuantity} onChange={update('stockQuantity')} />
              </div>
            </div>

            {discountInfo && (
              <div className="discount-calc-banner">
                <Sparkles size={18} color="#10B981" />
                <div>
                  <strong>Customer Savings Computed:</strong>
                  <span>Save ₹{discountInfo.saveAmt.toLocaleString()} ({discountInfo.pct}% OFF)</span>
                </div>
              </div>
            )}

            <div className="apf-row-2" style={{ marginTop: '12px' }}>
              <div className="apf-group apf-check-card">
                <label className="apf-checkbox-label">
                  <input type="checkbox" checked={form.bestseller} onChange={update('bestseller')} />
                  <span>★ Mark as Bestseller Catalog (Featured Pill)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Dimensions & Specifications */}
          <div className="apf-card">
            <div className="card-head-between">
              <h3 className="card-title">📐 Product Dimensions &amp; Size</h3>
            </div>

            <p className="apf-card-hint">
              Enter the exact physical dimensions of this home decor item (displayed as fixed specifications on the storefront):
            </p>

            <div className="apf-group" style={{ marginTop: 12 }}>
              <label>Dimensions (e.g. 50 × 80 cm / 40 × 60 cm)</label>
              <input
                type="text"
                placeholder="e.g. 40 × 60 cm, 50 × 80 cm, or 12 × 18 Inches"
                value={form.dimensions || ''}
                onChange={update('dimensions')}
                className="apf-input"
              />
            </div>
          </div>

          {/* Card 4: Logistics & Warranty */}
          <div className="apf-card">
            <h3 className="card-title">🛡️ Logistics, Shipping &amp; Warranty</h3>
            <div className="apf-row-2">
              <div className="apf-group">
                <label>Warranty Period</label>
                <select value={form.warranty} onChange={update('warranty')} className="apf-select">
                  <option value="1 Year AAAN Official Warranty">1 Year Official Warranty</option>
                  <option value="6 Months Replacement Warranty">6 Months Replacement Warranty</option>
                  <option value="3 Months Limited Warranty">3 Months Warranty</option>
                  <option value="No Warranty (Tested genuine)">No Warranty (Standard)</option>
                </select>
              </div>

              <div className="apf-group">
                <label>Fulfillment Shipping</label>
                <select value={form.shippingType} onChange={update('shippingType')} className="apf-select">
                  <option value="Free Express Shipping">Free Same-Day Express Dispatch</option>
                  <option value="Standard Ground Courier">Standard Ground Courier</option>
                  <option value="COD Supported">Cash on Delivery Supported</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Media Upload & Live Storefront Preview */}
        <div className="catalog-form-sidebar">
          
          {/* Media Upload Card */}
          <div className="apf-card">
            <div className="card-head-between">
              <h3 className="card-title">📸 Catalog Gallery</h3>
              <span className="apf-count">{totalCount} / {MAX_IMAGES}</span>
            </div>

            {totalCount > 0 && (
              <div className="apf-thumb-grid">
                {previews.map((p, i) => (
                  <div className={`apf-thumb ${i === 0 ? 'cover' : ''}`} key={i}>
                    <img src={p.url} alt={`Product ${i + 1}`} loading="lazy" />
                    {i === 0 && <span className="apf-cover-badge">Primary</span>}
                    <button
                      type="button"
                      className="apf-thumb-remove"
                      onClick={() => removePreview(i)}
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalCount < MAX_IMAGES && (
              <div
                className="apf-dropzone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="apf-dropzone-empty">
                  <ImagePlus size={32} color="#6366F1" />
                  <p className="apf-drop-title">Drag images or click to upload</p>
                  <p className="apf-drop-hint">Up to {MAX_IMAGES} images · WebP, JPG, PNG</p>
                </div>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {totalCount < MAX_IMAGES && (
              <button
                type="button"
                className="apf-browse-btn"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={16} /> {totalCount === 0 ? 'Upload Catalog Images' : 'Add More Photos'}
              </button>
            )}
          </div>

          {/* Real-Time Storefront Card Preview */}
          <div className="apf-card preview-card-wrapper">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={18} color="#10B981" /> Live Storefront Card Preview
            </h3>

            <div className="storefront-preview-card">
              <div className="preview-img-box">
                <img
                  src={previews.length > 0 ? previews[0].url : '/aaan-logo.svg'}
                  alt="Live Preview"
                  loading="lazy"
                />
                {discountInfo && (
                  <span className="preview-save-tag">-{discountInfo.pct}%</span>
                )}
                {form.bestseller && (
                  <span className="preview-bestseller-tag">★ BESTSELLER</span>
                )}
              </div>

              <div className="preview-body">
                <span className="preview-cat">{selectedCatObj?.name || 'Category'}</span>
                <h4 className="preview-title">{form.name || 'Catalog Product Name'}</h4>

                <div className="preview-price-row">
                  <span className="preview-price">{formatPrice(form.price || 0)}</span>
                  {form.originalPrice && (
                    <span className="preview-orig-price">{formatPrice(form.originalPrice)}</span>
                  )}
                </div>

                {(form.sizes || []).length > 0 && (
                  <div className="preview-sizes-list">
                    {(form.sizes || []).map((sz) => (
                      <span key={sz} className="preview-size-pill">{sz}</span>
                    ))}
                  </div>
                )}

                <div className="preview-cta-btn">View Product Details</div>
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="apf-card actions-card">
            <button type="submit" className="btn-publish-catalog" disabled={loading}>
              {loading ? 'Publishing…' : isEdit ? '✓ Update Catalog Item' : '✨ Publish Catalog Item'}
            </button>
            <button type="button" className="btn-cancel-catalog" onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
          </div>

        </div>
      </form>

      {/* AI Copy & SEO Generator Modal Popup */}
      {showAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowAiModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '28px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAiModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <AdminAiGenerator onApplyToCatalog={handleApplyAiContent} />
          </div>
        </div>
      )}

      {/* AI Image Enhancement Studio Modal Popup */}
      {showImageEnhancerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowImageEnhancerModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '28px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageEnhancerModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <AdminImageEnhancer onApplyEnhancedImage={handleApplyEnhancedImage} />
          </div>
        </div>
      )}
    </div>
  );
}
