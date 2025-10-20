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

  // Dark mode colors
  dark: {
    bg: '#000000',        // Pure black
    surface: '#0A0A0A',   // Near black
  },

  // Text colors
  text: {
    main: '#0A0A0A',      // Almost black
    subtle: '#525252',    // Medium gray
    inverse: '#FFFFFF',   // White
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
