// 3D Plant & Butterfly Stickers Catalog with 3D Assets

export const STICKER_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '✨', count: 9 },
  { id: 'niche', name: '3D Wall Niche', icon: '🏛️', count: 4 },
  { id: 'butterflies', name: '3D Butterflies', icon: '🦋', count: 2 },
  { id: 'plants', name: '3D Tropical Plants', icon: '🌿', count: 2 },
  { id: 'succulents', name: '3D Succulents', icon: '🌸', count: 1 },
];

export const FINISH_OPTIONS = [
  { id: 'trompe-loeil', name: "Trompe-l'œil 3D Vinyl", color: '#4A5568', tag: 'Optical Illusion' },
  { id: 'holographic', name: 'Holographic Crystal', color: '#6366F1', tag: 'Prism Shimmer' },
  { id: 'embossed-matte', name: 'Embossed Matte 3D', color: '#10B981', tag: 'Raised Texture' },
  { id: 'glow', name: 'Glow in the Dark', color: '#F59E0B', tag: 'Night Luminous' }
];

export const SIZE_OPTIONS = [
  { id: 'small', label: '40 × 60 cm', sub: 'Standard Niche', priceDiff: 0 },
  { id: 'medium', label: '50 × 80 cm', sub: 'Living Room', priceDiff: 150 },
  { id: 'large', label: '60 × 100 cm', sub: 'Feature Wall', priceDiff: 300 },
  { id: 'pack12', label: '12-Piece Set', sub: 'Butterfly Pack', priceDiff: 0 }
];

export const WALL_COLORS = [
  { id: 'white', name: 'Alabaster White', hex: '#F8FAFC', textColor: '#0F172A' },
  { id: 'beige', name: 'Warm Cream', hex: '#F4ECE1', textColor: '#1C1917' },
  { id: 'sage', name: 'Nordic Sage', hex: '#E2EBE5', textColor: '#132A13' },
  { id: 'charcoal', name: 'Charcoal Accent', hex: '#2D3748', textColor: '#FFFFFF' }
];

export const STICKER_PRODUCTS = [
  {
    _id: 'sticker-1',
    name: '3D Monstera Niche Wall Sticker',
    slug: '3d-monstera-niche-wall-sticker',
    tagline: 'Recessed wall alcove illusion with top spotlight & clear glass vase',
    category: '3D Wall Niche',
    categorySlug: 'niche',
    price: 999,
    finalPrice: 499,
    discountPercent: 50,
    rating: 4.9,
    reviewCount: 342,
    image: '/stickers/niche_monstera_3d_1787582973768.jpg',
    images: [
      '/stickers/niche_monstera_3d_1787582973768.jpg',
      '/stickers/monstera_plant_3d_1787582875364.jpg'
    ],
    badge: '🔥 BESTSELLER',
    is3D: true,
    nicheType: 'Arch & Spotlight',
    description: 'Transform any plain flat wall into a luxurious architectural recessed niche. Features a trompe-l’œil ceiling spotlight beam illuminating a crystal glass vase with vibrant Monstera Deliciosa and forest ferns, creating jaw-dropping depth perception.',
    features: [
      'Hyper-realistic 3D recessed wall perspective',
      'Integrated spotlight beam illusion for dramatic depth',
      'Removable, residue-free premium waterproof vinyl',
      'Wipeable surface with UV-fade resistant ink'
    ],
    sizes: ['40 × 60 cm', '50 × 80 cm', '60 × 100 cm'],
    inStock: true
  },
  {
    _id: 'sticker-2',
    name: '3D Royal Violet Bouquet & Butterfly Niche',
    slug: '3d-royal-violet-bouquet-butterfly-niche',
    tagline: 'Arch alcove with emerald vase, purple flowers & 3D flying butterflies',
    category: '3D Wall Niche',
    categorySlug: 'niche',
    price: 1199,
    finalPrice: 599,
    discountPercent: 50,
    rating: 4.9,
    reviewCount: 289,
    image: '/stickers/niche_flowers_3d_1787582996187.jpg',
    images: [
      '/stickers/niche_flowers_3d_1787582996187.jpg',
      '/stickers/blue_butterfly_3d_1787582894782.jpg'
    ],
    badge: '✨ TRENDING',
    is3D: true,
    nicheType: 'Classical Arch Niche',
    description: 'Stunning 3D optical illusion of a classical stone alcove niche with a gilded emerald ceramic vase filled with purple ranunculus blossoms and shimmering 3D butterflies appearing to fly right out of the wall.',
    features: [
      'Multi-depth 3D floral arrangement with floating butterflies',
      'Classical stone archway texture and warm downward lighting',
      'Ultra-high definition 300 DPI micro-embossed printing',
      'Easy peel & stick application for bedrooms and living rooms'
    ],
    sizes: ['40 × 60 cm', '50 × 80 cm', '60 × 100 cm'],
    inStock: true
  },
  {
    _id: 'sticker-3',
    name: '3D Shimmering Blue Morpho Butterfly Decal',
    slug: '3d-shimmering-blue-morpho-butterfly-decal',
    tagline: 'Holographic 3D embossed crystal wings with lifelike drop shadow',
    category: '3D Butterflies',
    categorySlug: 'butterflies',
    price: 699,
    finalPrice: 349,
    discountPercent: 50,
    rating: 4.95,
    reviewCount: 476,
    image: '/stickers/blue_butterfly_3d_1787582894782.jpg',
    images: [
      '/stickers/blue_butterfly_3d_1787582894782.jpg'
    ],
    badge: '🦋 POPULAR',
    is3D: true,
    nicheType: '3D Layered Wings',
    description: 'Hyper-realistic 3D die-cut butterfly wall sticker featuring iridescent Blue Morpho wings with prism-cut geometric facets. Fold the wings slightly forward for genuine 3D lifelike dimension and dramatic cast shadows on your wall.',
    features: [
      'Foldable dual-layer wings for genuine 3D lift off the wall',
      'Holographic prism foil finish that catches room light',
      'Includes traceless wall adhesive pads (safe on paint & wallpaper)',
      'Set includes multiple sizes for a flying flock effect'
    ],
    sizes: ['12-Piece Set (Mixed Sizes)', '24-Piece Deluxe Pack'],
    inStock: true
  },
  {
    _id: 'sticker-4',
    name: '3D White Orchid & Palm Niche Wall Decal',
    slug: '3d-white-orchid-palm-niche-wall-decal',
    tagline: 'Modern alcove with natural oak shelf, spotlight & blooming white orchids',
    category: '3D Wall Niche',
    categorySlug: 'niche',
    price: 1099,
    finalPrice: 549,
    discountPercent: 50,
    rating: 4.88,
    reviewCount: 215,
    image: '/stickers/niche_orchid_3d_1787583015054.jpg',
    images: [
      '/stickers/niche_orchid_3d_1787583015054.jpg'
    ],
    badge: '🌿 ZEN LIVING',
    is3D: true,
    nicheType: 'Modern Wood Shelf Niche',
    description: 'Bring tranquil Japandi style into your home. This 3D optical illusion sticker shows a modern minimalist recessed niche with a natural wood shelf and a glass vase filled with fresh white orchids and tropical fan palms.',
    features: [
      'Realistic wood grain ledge with downward spotlight shadow',
      'Pure white moth orchid blooms and botanical foliage',
      'Creates instant architectural luxury in hallways and dining areas',
      'Durable, moisture-proof and easily removable'
    ],
    sizes: ['40 × 60 cm', '50 × 80 cm', '60 × 100 cm'],
    inStock: true
  },
  {
    _id: 'sticker-5',
    name: '3D Golden Monarch Butterfly Wall Decal Pack',
    slug: '3d-golden-monarch-butterfly-wall-decal-pack',
    tagline: 'Gold foil accented embossed wings with 3D floating relief',
    category: '3D Butterflies',
    categorySlug: 'butterflies',
    price: 799,
    finalPrice: 399,
    discountPercent: 50,
    rating: 4.92,
    reviewCount: 310,
    image: '/stickers/monarch_butterfly_3d_1787582931421.jpg',
    images: [
      '/stickers/monarch_butterfly_3d_1787582931421.jpg'
    ],
    badge: '⭐ TOP RATED',
    is3D: true,
    nicheType: 'Metallic Foil Wings',
    description: 'Exquisite 3D monarch butterfly wall stickers with metallic gold foil vein details. Create an enchanting flying butterfly trail across living room walls, mirrors, headboards, and entryways.',
    features: [
      'Embossed gold foil outlines with rich amber gradients',
      'Bendable wings create realistic fluttering shadow effects',
      'Dual-adhesive: Safe on smooth walls, wood, tile, and glass',
      'Package includes 12 pieces with 4 distinct sizes'
    ],
    sizes: ['12-Piece Set', '24-Piece Set'],
    inStock: true
  },
  {
    _id: 'sticker-6',
    name: '3D Sunburst Protea Floral Niche Sticker',
    slug: '3d-sunburst-protea-floral-niche-sticker',
    tagline: 'Stone arch niche with bright yellow pincushion flowers & glass vase',
    category: '3D Wall Niche',
    categorySlug: 'niche',
    price: 1049,
    finalPrice: 529,
    discountPercent: 50,
    rating: 4.85,
    reviewCount: 168,
    image: '/stickers/niche_yellow_flora_3d_1787583091372.jpg',
    images: [
      '/stickers/niche_yellow_flora_3d_1787583091372.jpg'
    ],
    badge: '☀️ WARM VIBES',
    is3D: true,
    nicheType: 'Stone Arch Niche',
    description: 'Impart warm sunlight and vitality with this trompe-l’œil stone arch wall sticker. A spotlight shines down on bright yellow pincushion blossoms in a tall water vase, casting intricate floral shadows on the niche base.',
    features: [
      'Vibrant golden yellow floral arrangement with water reflection',
      'Detailed weathered stone niche texture with overhead luminaire',
      'Thick bubble-free air release vinyl for effortless installation',
      'Waterproof and easily cleanable with a damp cloth'
    ],
    sizes: ['40 × 60 cm', '50 × 80 cm', '60 × 100 cm'],
    inStock: true
  },
  {
    _id: 'sticker-7',
    name: '3D Echeveria Succulent Bloom Wall Decal',
    slug: '3d-echeveria-succulent-bloom-wall-decal',
    tagline: 'Pastel teal & pink tipped 3D layered succulent petals with gloss shine',
    category: '3D Succulents',
    categorySlug: 'succulents',
    price: 599,
    finalPrice: 299,
    discountPercent: 50,
    rating: 4.9,
    reviewCount: 195,
    image: '/stickers/succulent_plant_3d_1787582910119.jpg',
    images: [
      '/stickers/succulent_plant_3d_1787582910119.jpg'
    ],
    badge: '🌸 CUTE DECOR',
    is3D: true,
    nicheType: 'Layered Petals',
    description: 'Delightful 3D embossed vinyl sticker of a blooming Echeveria succulent. Features soft pastel mint green and pink-tipped petals with multi-layer depth and a glossy protective dome coat.',
    features: [
      'Multi-layer 3D petal depth with high-gloss dome layer',
      'Die-cut precision border with soft realistic shadow',
      'Great for plant nooks, desks, laptop cases, and accent walls',
      'Scratchproof and UV-resistant'
    ],
    sizes: ['25 × 25 cm', '35 × 35 cm', '50 × 50 cm'],
    inStock: true
  },
  {
    _id: 'sticker-8',
    name: '3D Pink Princess Philodendron Leaf Decal',
    slug: '3d-pink-princess-philodendron-leaf-decal',
    tagline: 'Neon bubblegum pink & dark emerald variegated 3D embossed leaf',
    category: '3D Tropical Plants',
    categorySlug: 'plants',
    price: 649,
    finalPrice: 329,
    discountPercent: 49,
    rating: 4.94,
    reviewCount: 220,
    image: '/stickers/pink_princess_3d_1787582949663.jpg',
    images: [
      '/stickers/pink_princess_3d_1787582949663.jpg'
    ],
    badge: '💖 RARE PLANT',
    is3D: true,
    nicheType: 'Embossed Leaf',
    description: 'The holy grail of houseplant lovers in 3D wall art form! Features vivid bubblegum pink marbling contrasted against dark forest green foliage with realistic raised leaf veins and glossy sheen.',
    features: [
      'Collector-grade Pink Princess variegation with 3D embossed texture',
      'Die-cut contour with natural leaf curvature illusion',
      'Tear-proof heavy-duty vinyl with permanent or removable mounting',
      'Perfect gift for botanical lovers and aesthetic room makeovers'
    ],
    sizes: ['30 × 40 cm', '45 × 60 cm', '60 × 80 cm'],
    inStock: true
  },
  {
    _id: 'sticker-9',
    name: '3D Lush Monstera Deliciosa Die-Cut Decal',
    slug: '3d-lush-monstera-deliciosa-die-cut-decal',
    tagline: 'Deep emerald fenestrated leaf with raised gloss ridges and drop shadow',
    category: '3D Tropical Plants',
    categorySlug: 'plants',
    price: 599,
    finalPrice: 299,
    discountPercent: 50,
    rating: 4.89,
    reviewCount: 380,
    image: '/stickers/monstera_plant_3d_1787582875364.jpg',
    images: [
      '/stickers/monstera_plant_3d_1787582875364.jpg'
    ],
    badge: '🌿 BOTANICAL',
    is3D: true,
    nicheType: 'Embossed Leaf',
    description: 'Iconic Swiss Cheese plant leaf rendered in stunning 3D depth. Raised glossy ribs and realistic drop shadows make it look like a fresh tropical leaf is growing right out of your wall.',
    features: [
      'Raised glossy leaf ribs and natural fenestrations',
      'Realistic shadow boundary for authentic depth perception',
      'Waterproof, heat resistant and anti-static',
      'Ideal for bathrooms, green walls, balconies, and bedrooms'
    ],
    sizes: ['30 × 30 cm', '45 × 45 cm', '60 × 60 cm'],
    inStock: true
  }
];
