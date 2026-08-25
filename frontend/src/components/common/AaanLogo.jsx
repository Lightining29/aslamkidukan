import React from 'react';

export default function AaanLogo({
  variant = 'full', // 'full' | 'icon' | 'text'
  size = 'md',      // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  light = false
}) {
  const sizeMap = {
    sm: { icon: 28, title: '1.1rem', sub: '0.55rem', gap: '8px' },
    md: { icon: 38, title: '1.45rem', sub: '0.62rem', gap: '10px' },
    lg: { icon: 50, title: '1.9rem', sub: '0.72rem', gap: '14px' },
    xl: { icon: 68, title: '2.6rem', sub: '0.85rem', gap: '18px' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const textColor = light ? '#FFFFFF' : '#0F172A';
  const subColor = light ? 'rgba(255, 255, 255, 0.75)' : '#64748B';

  return (
    <div
      className={`aaan-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: currentSize.gap,
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {(variant === 'full' || variant === 'icon') && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0px 4px 12px rgba(99, 102, 241, 0.35))' }}
          >
            <defs>
              <linearGradient id="aaan-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="45%" stopColor="#7C3AED" />
                <stop offset="80%" stopColor="#D946EF" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient id="aaan-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="aaan-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <filter id="aaan-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing outer ring frame */}
            <rect
              x="5"
              y="5"
              width="90"
              height="90"
              rx="24"
              fill="url(#aaan-grad-primary)"
              fillOpacity="0.08"
              stroke="url(#aaan-grad-primary)"
              strokeWidth="2.5"
              strokeDasharray="180 30"
            />

            {/* Left Alpha A stem */}
            <path
              d="M 28 75 L 44 25 C 45 22, 49 22, 50 25 L 56 42 L 40 75 Z"
              fill="url(#aaan-grad-accent)"
            />

            {/* Right Alpha A stem */}
            <path
              d="M 72 75 L 56 25 C 55 22, 51 22, 50 25 L 44 42 L 60 75 Z"
              fill="url(#aaan-grad-primary)"
            />

            {/* Central Monogram N Cross / Bridge Bar */}
            <path
              d="M 32 58 Q 50 44 68 58 L 68 66 Q 50 52 32 66 Z"
              fill="url(#aaan-grad-gold)"
            />

            {/* Apex Diamond Star Sparkle */}
            <polygon
              points="50,14 53,21 60,24 53,27 50,34 47,27 40,24 47,21"
              fill="#F43F5E"
            />
          </svg>
        </div>
      )}

      {(variant === 'full' || variant === 'text') && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <div
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: currentSize.title,
              fontWeight: 800,
              letterSpacing: '1.5px',
              background: light
                ? 'linear-gradient(135deg, #FFFFFF 0%, #FFE600 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 40%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: light ? '#FFFFFF' : '#0F172A',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>AAAN</span>
            <span
              style={{
                fontSize: `calc(${currentSize.title} * 0.5)`,
                padding: '2px 8px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                WebkitTextFillColor: '#FFFFFF',
                fontWeight: 800,
                letterSpacing: '1px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              CART
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: currentSize.sub,
              fontWeight: 700,
              letterSpacing: '2px',
              color: light ? '#F8FAFC' : '#10B981',
              textTransform: 'uppercase',
              marginTop: '3px'
            }}
          >
            3D STICKERS STUDIO
          </span>
        </div>
      )}
    </div>
  );
}
