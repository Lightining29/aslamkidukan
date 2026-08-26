import { compressImage } from '../utils/imageCompressor.js';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5000/api' : '/api');

function getToken() {
  return localStorage.getItem('glowora_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('glowora_token', token);
  else localStorage.removeItem('glowora_token');
}

/** Standard JSON fetch */
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const defaultMsg = res.status === 401 
      ? 'Session expired or login required. Please log in.' 
      : `Server error (${res.status} ${res.statusText || ''})`.trim();
    const error = new Error(data.message || data.error || defaultMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/**
 * Multipart/FormData fetch (for file uploads).
 * Do NOT set Content-Type — browser sets it with boundary automatically.
 */
async function apiUpload(path, method, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, body: formData, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Upload failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

/* ── Public ── */
// In-memory cache for categories — avoids re-fetching on every navigation
const _cache = { categories: null, categoriesAt: 0 };
const CATEGORY_TTL = 60_000; // 60 seconds

export async function fetchCategories() {
  const now = Date.now();
  if (_cache.categories && now - _cache.categoriesAt < CATEGORY_TTL) {
    return _cache.categories;
  }
  const data = await apiFetch('/categories');
  _cache.categories = data;
  _cache.categoriesAt = now;
  return data;
}
export function invalidateCategoryCache() { _cache.categories = null; }
export async function fetchCategory(slug) { return apiFetch(`/categories/${slug}`); }
export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/products${query ? `?${query}` : ''}`);
}
export async function fetchProduct(slug) { return apiFetch(`/products/${slug}`); }
export async function fetchBlogs() { return apiFetch('/blogs'); }
export async function fetchBlog(slug) { return apiFetch(`/blogs/${slug}`); }

/* ── Auth ── */
export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function loginWithGoogle(credential) {
  return apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) });
}
export async function register(name, email, password, photoFile) {
  const fd = new FormData();
  fd.append('name', name);
  fd.append('email', email);
  fd.append('password', password);
  if (photoFile) {
    const compressed = await compressImage(photoFile);
    fd.append('photo', compressed);
  }
  return apiUpload('/auth/register', 'POST', fd);
}

export async function verifyOtp(email, code) {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function resendOtp(email) {
  return apiFetch('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
export async function fetchMe() { return apiFetch('/auth/me'); }

/* ── User ── */
export async function fetchWishlist() { return apiFetch('/users/wishlist'); }
export async function addToWishlist(productId) {
  return apiFetch(`/users/wishlist/${productId}`, { method: 'POST' });
}
export async function removeFromWishlist(productId) {
  return apiFetch(`/users/wishlist/${productId}`, { method: 'DELETE' });
}

/* ── Orders ── */
export async function checkout(items, shippingAddress) {
  return apiFetch('/orders/checkout', { method: 'POST', body: JSON.stringify({ items, shippingAddress }) });
}
export async function verifyPayment(orderId, { razorpayPaymentId, razorpaySignature }) {
  return apiFetch(`/orders/verify/${orderId}`, {
    method: 'POST',
    body: JSON.stringify({ razorpayPaymentId, razorpaySignature }),
  });
}
export async function createRazorpayOrder({ amount, currency = 'INR', receipt }) {
  return apiFetch('/create-order', {
    method: 'POST',
    body: JSON.stringify({ amount, currency, receipt }),
  });
}
export async function verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  return apiFetch('/verify-payment', {
    method: 'POST',
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
  });
}
export async function fetchMyOrders() { return apiFetch('/orders/my'); }
export async function fetchOrder(id) { return apiFetch(`/orders/${id}`); }

/* ── Banner (public) ── */
export async function fetchBanner() { return apiFetch('/banner'); }

/* ── Admin: Analytics ── */
export async function fetchAdminAnalytics() { return apiFetch('/admin/analytics'); }

/* ── Admin: Banner ── */
export async function fetchAdminBanner() { return apiFetch('/admin/banner'); }

/**
 * Update banner — sends FormData so image files can be included.
 * @param {object} fields  — text fields { heading, subheading, … }
 * @param {File|null} heroImageFile  — optional new hero image File
 * @param {File|null} promoImageFile — optional new promo image File
 */
export async function updateAdminBanner(fields, heroImageFile, promoImageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  if (heroImageFile) {
    const compressed = await compressImage(heroImageFile);
    fd.append('image', compressed);
  }
  if (promoImageFile) {
    const compressed = await compressImage(promoImageFile);
    fd.append('promoImage', compressed);
  }
  return apiUpload('/admin/banner', 'PUT', fd);
}

/* ── Admin: Orders ── */
export async function fetchAdminOrders() { return apiFetch('/admin/orders'); }
export async function approveOrder(id) {
  return apiFetch(`/admin/orders/${id}/approve`, { method: 'PATCH' });
}
export async function shipOrder(id) {
  return apiFetch(`/admin/orders/${id}/ship`, { method: 'PATCH' });
}
export async function createOfflineSale(fields) {
  return apiFetch('/admin/orders/offline', {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}

/* ── Admin: Products ── */
export async function fetchAdminProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/admin/products${query ? `?${query}` : ''}`);
}
export async function fetchAdminCategories() { return apiFetch('/admin/categories'); }

/* ── Flash Sale (public) ── */
export async function fetchFlashSaleProducts() { return apiFetch('/products/flash-sale'); }

/* ── Promo Banners (public) ── */
export async function fetchPromoBanners(position) {
  const q = position ? `?position=${position}` : '';
  return apiFetch(`/promo-banners${q}`);
}

/* ── Flash Sale (admin) ── */
export async function fetchAdminFlashSale() { return apiFetch('/admin/flash-sale'); }
export async function updateAdminFlashSale(id, data) {
  return apiFetch(`/admin/flash-sale/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}
export async function removeAdminFlashSale(id) {
  return apiFetch(`/admin/flash-sale/${id}`, { method: 'DELETE' });
}

/* ── Promo Banners (admin) ── */
export async function fetchAdminPromoBanners() { return apiFetch('/admin/promo-banners'); }

export async function createAdminPromoBanner(fields, imageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (imageFile) {
    const compressed = await compressImage(imageFile);
    fd.append('image', compressed);
  }
  return apiUpload('/admin/promo-banners', 'POST', fd);
}

export async function updateAdminPromoBanner(id, fields, imageFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (imageFile) {
    const compressed = await compressImage(imageFile);
    fd.append('image', compressed);
  }
  return apiUpload(`/admin/promo-banners/${id}`, 'PUT', fd);
}

export async function deleteAdminPromoBanner(id) {
  return apiFetch(`/admin/promo-banners/${id}`, { method: 'DELETE' });
}

export async function patchAdminPromoBanner(id, data) {
  return apiFetch(`/admin/promo-banners/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function submitContact(fields) { return apiFetch('/contact', { method: 'POST', body: JSON.stringify(fields) }); }
export async function fetchAdminContacts() { return apiFetch('/admin/contacts'); }
export async function markContactRead(id) { return apiFetch(`/admin/contacts/${id}/read`, { method: 'PATCH' }); }
export async function deleteAdminContact(id) { return apiFetch(`/admin/contacts/${id}`, { method: 'DELETE' }); }

export async function createAdminCategory(fields, imageFile) {
  const fd = new FormData();
  if (fields.name) fd.append('name', fields.name);
  if (imageFile) {
    const compressed = await compressImage(imageFile);
    fd.append('image', compressed);
  }
  const result = await apiUpload('/admin/categories', 'POST', fd);
  invalidateCategoryCache();
  return result;
}

export async function updateAdminCategory(id, fields, imageFile) {
  const fd = new FormData();
  if (fields.name) fd.append('name', fields.name);
  if (imageFile) {
    const compressed = await compressImage(imageFile);
    fd.append('image', compressed);
  }
  const result = await apiUpload(`/admin/categories/${id}`, 'PUT', fd);
  invalidateCategoryCache();
  return result;
}

export async function deleteAdminCategory(id) {
  const result = await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
  invalidateCategoryCache();
  return result;
}

/**
 * Create product — sends FormData with one or more "images" files (max 5).
 * @param {object} fields — product fields (name, price, etc.)
 * @param {File[]} imageFiles — array of image files (at least 1 required)
 */
export async function createProduct(fields, imageFiles = []) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  const compressedFiles = await Promise.all(imageFiles.map(file => compressImage(file)));
  compressedFiles.forEach((file) => fd.append('images', file));
  return apiUpload('/admin/products', 'POST', fd);
}

/**
 * Update product — sends FormData; images are optional.
 * @param {string} id
 * @param {object} fields
 * @param {File[]} imageFiles — new files to replace the current set (optional)
 * @param {object} opts — { deleteIndices: number[] } positions of existing
 *                       images to remove (ignored when imageFiles is non-empty)
 */
export async function updateProduct(id, fields, imageFiles = [], opts = {}) {
  const { deleteIndices = [] } = opts;
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (imageFiles && imageFiles.length > 0) {
    const compressedFiles = await Promise.all(imageFiles.map(file => compressImage(file)));
    compressedFiles.forEach((file) => fd.append('images', file));
  } else if (Array.isArray(deleteIndices) && deleteIndices.length > 0) {
    // Each index becomes a repeated form field; backend normalizes to an array.
    deleteIndices.forEach((i) => fd.append('deleteImageIndex', String(i)));
  }
  return apiUpload(`/admin/products/${id}`, 'PUT', fd);
}

export async function updateStock(id, stockQuantity) {
  return apiFetch(`/admin/products/${id}/stock`, {
    method: 'PATCH', body: JSON.stringify({ stockQuantity }),
  });
}
export async function updateDiscount(id, discountPercent) {
  return apiFetch(`/admin/products/${id}/discount`, {
    method: 'PATCH', body: JSON.stringify({ discountPercent }),
  });
}
export async function deleteProduct(id) {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}

/* ── Admin: Stock Management ── */
export async function fetchStockLevels() {
  return apiFetch('/stock/levels');
}
export async function fetchStockTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/stock/transactions${query ? `?${query}` : ''}`);
}
export async function fetchProductStockHistory(productId) {
  return apiFetch(`/stock/transactions/${productId}`);
}
export async function addStock(productId, quantity, reason, notes) {
  return apiFetch('/stock/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, reason, notes }),
  });
}
export async function removeStock(productId, quantity, reason, notes) {
  return apiFetch('/stock/remove', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, reason, notes }),
  });
}
export async function adjustStock(productId, newQuantity, reason, notes) {
  return apiFetch('/stock/adjust', {
    method: 'POST',
    body: JSON.stringify({ productId, newQuantity, reason, notes }),
  });
}

/* ── Reviews (public + authenticated) ── */
export async function fetchProductReviews(productId, { page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) }).toString();
  return apiFetch(`/reviews/product/${productId}?${query}`);
}

export async function fetchMyReview(productId) {
  return apiFetch(`/reviews/mine/${productId}`);
}

/**
 * Create a review — sends FormData (multipart) with up to 4 "photos" files.
 * @param {object} fields — { productId, rating, comment }
 * @param {File[]} photoFiles — optional review photos
 */
export async function createReview(fields, photoFiles = []) {
  const fd = new FormData();
  fd.append('productId', fields.productId);
  fd.append('rating', String(fields.rating));
  if (fields.comment) fd.append('comment', String(fields.comment));
  const compressedFiles = await Promise.all(photoFiles.map(file => compressImage(file)));
  compressedFiles.forEach((file) => fd.append('photos', file));
  return apiUpload('/reviews', 'POST', fd);
}

/**
 * Update a review — FormData; photos optional.
 * @param {string} id
 * @param {object} fields — { rating?, comment? }
 * @param {File[]} photoFiles — new photos to replace the set (optional)
 * @param {object} opts — { deleteIndices: number[] } to remove existing photos
 */
export async function updateReview(id, fields = {}, photoFiles = [], opts = {}) {
  const { deleteIndices = [] } = opts;
  const fd = new FormData();
  if (fields.rating !== undefined) fd.append('rating', String(fields.rating));
  if (fields.comment !== undefined) fd.append('comment', String(fields.comment));
  if (photoFiles && photoFiles.length > 0) {
    const compressedFiles = await Promise.all(photoFiles.map(file => compressImage(file)));
    compressedFiles.forEach((file) => fd.append('photos', file));
  } else if (Array.isArray(deleteIndices) && deleteIndices.length > 0) {
    deleteIndices.forEach((i) => fd.append('deletePhotoIndex', String(i)));
  }
  return apiUpload(`/reviews/${id}`, 'PUT', fd);
}

export async function deleteReview(id) {
  return apiFetch(`/reviews/${id}`, { method: 'DELETE' });
}

/* ── Admin: Reviews ── */
export async function fetchAdminReviews() { return apiFetch('/admin/reviews'); }
export async function deleteAdminReview(id) {
  return apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
}

/* ── Helpers ── */
export function formatPrice(price) { return `₹${Number(price).toFixed(2)}`; }
export function getProductPrice(product) { return product.finalPrice ?? product.price; }

export function getStatusLabel(status) {
  const labels = {
    pending_payment: 'Pending Payment',
    paid: 'Paid — Awaiting Approval',
    approved: 'Approved',
    shipped: 'Shipped',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    pending_payment: '#F59E0B',
    paid: '#3B82F6',
    approved: '#10B981',
    shipped: '#8B5CF6',
    cancelled: '#EF4444',
  };
  return colors[status] || '#6B7C8D';
}

export async function forgotPassword(email) {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(email, code, newPassword) {
  return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code, newPassword }) });
}

export async function changePassword(currentPassword, newPassword) {
  return apiFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) });
}

export async function updateProfile(fields) {
  return apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(fields) });
}
