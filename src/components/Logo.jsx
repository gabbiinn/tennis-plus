// Composants logo TENNIS+
// Le monogramme change automatiquement selon la saison de tennis

export function getSeasonSurface() {
  const month = new Date().getMonth(); // 0 = janvier
  if (month >= 3 && month <= 5) return 'clay';   // avril-juin → terre battue
  if (month >= 6 && month <= 7) return 'grass';  // juillet-août → gazon
  return 'hard';                                  // reste de l'année → dur (bleu)
}

const SURFACE_COLORS = {
  hard: '#1E5FAF',
  clay: '#C75D3F',
  grass: '#2D5016'
};

// Monogramme TENNIS+ (carré arrondi avec un + dedans)
export function Monogram({ size = 36, surface = null }) {
  const s = surface || getSeasonSurface();
  const color = SURFACE_COLORS[s];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill={color} />
      <rect x="42" y="20" width="16" height="60" fill="white" />
      <rect x="20" y="42" width="60" height="16" fill="white" />
      <line x1="20" y1="50" x2="80" y2="50" stroke={color} strokeWidth="1.2" opacity="0.5" />
      <line x1="50" y1="20" x2="50" y2="80" stroke={color} strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

// Wordmark TENNIS+ (logo complet avec le nom)
export function Wordmark({ height = 32, surface = null, textColor = '#0A0A0A' }) {
  const s = surface || getSeasonSurface();
  const plusColor = SURFACE_COLORS[s];

  return (
    <svg height={height} viewBox="0 0 320 80" style={{ display: 'block' }}>
      <text x="0" y="60" fontFamily="Archivo Black, sans-serif" fontSize="64" fontWeight="900" fill={textColor} letterSpacing="-2">TENNIS</text>
      <g transform="translate(232, 18)">
        <rect x="18" y="0" width="14" height="50" fill={plusColor} />
        <rect x="0" y="18" width="50" height="14" fill={plusColor} />
        <line x1="0" y1="25" x2="50" y2="25" stroke="white" strokeWidth="1.5" />
        <line x1="25" y1="0" x2="25" y2="50" stroke="white" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
