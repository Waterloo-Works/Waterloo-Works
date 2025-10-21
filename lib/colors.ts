/**
 * Minimal Design System Colors
 * HSL values exported as hex strings for use in OG images and other contexts
 * that can't access CSS variables.
 */

// Helper to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export const colors = {
  // Base colors (light mode)
  base: {
    bg: '#F6F5F2',        // Warm beige background
    surface: '#FFFFFF',   // White surface
    border: '#E3E2DD',    // Subtle border
    hover: '#EAEAE7',     // Hover state
  },

  // Dark mode colors (Japanese rustic warm palette)
  dark: {
    bg: '#211E1A',        // Softer warm charcoal
    surface: '#2E2823',   // Warm card surface
    sidebar: '#26211C',   // Deeper warm sidebar
    border: '#3E3935',    // Subtle refined border
    hover: '#322D28',     // Subtle warm muted
  },

  // Text colors
  text: {
    main: '#0A0A0A',      // Almost black
    subtle: '#525252',    // Medium gray
    inverse: '#FFFFFF',   // White
    warmLight: '#F0E8E0', // Brighter warm beige (for dark mode)
    warmMuted: '#BEB0A0', // Brighter warm gray (for dark mode)
  },

  // Accent colors (dark mode)
  accent: {
    terracotta: '#CDA285',  // Brighter terracotta
    goldenBrown: '#A08E79', // Brighter golden brown
  },
} as const;

// OG Image specific colors (dark theme for social previews)
export const ogColors = {
  background: colors.dark.bg,
  foreground: colors.text.inverse,
  muted: colors.text.subtle,
  primary: colors.text.inverse,
  secondary: colors.text.subtle,
} as const;
