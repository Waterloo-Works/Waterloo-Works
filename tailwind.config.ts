import type { Config } from "tailwindcss";

/**
 * MINIMAL DESIGN SYSTEM
 *
 * Clean, minimal design with strong typography and subtle interactions
 * - Warm beige backgrounds (#F6F5F2) with crisp white surfaces
 * - High contrast dark mode with pure black
 * - Simple border radius and consistent spacing
 * - Focus on typography hierarchy and readability
 *
 * Usage examples:
 * - Semantic: bg-primary text-primary-foreground (theme-aware)
 * - Direct: bg-base-bg text-text-main
 * - Colors: bg-card border-border text-foreground
 */

export default {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	 extend: {
			fontFamily: {
				// Custom fonts + modern alternatives
				header: ["205 Tf Exposure 0", "Georgia", "serif"],
				body: ["Neuehaasgroteskdisplay", "Arial", "sans-serif"],
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			fontSize: {
				// Clean type scale with good hierarchy
				'display-lg': ['72px', { lineHeight: '1.1', fontWeight: '700' }],
				'display-md': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
				'display-sm': ['32px', { lineHeight: '1.3', fontWeight: '500' }],
				'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
				'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
				'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
				'label': ['12px', { lineHeight: '1.4', fontWeight: '400', letterSpacing: '0.5px' }],
				// Keep existing sizes for compatibility
				'h2': ["3rem", { lineHeight: "1", fontWeight: "400" }],
				'h3': ["2.25rem", { lineHeight: "1", fontWeight: "400" }],
			},
			spacing: {
				// 4px base unit system
				'18': '4.5rem',  // 72px
				'22': '5.5rem',  // 88px
				'26': '6.5rem',  // 104px
			},
			colors: {
				// Semantic tokens (theme-aware via CSS variables)
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},

				// === DIRECT UTILITIES ===
				base: {
					bg: 'hsl(var(--base-bg))',
					surface: 'hsl(var(--base-surface))',
					border: 'hsl(var(--base-border))',
					hover: 'hsl(var(--base-hover))',
				},
				dark: {
					bg: 'hsl(var(--dark-bg))',
					surface: 'hsl(var(--dark-surface))',
				},
				text: {
					main: 'hsl(var(--text-main))',
					subtle: 'hsl(var(--text-subtle))',
					inverse: 'hsl(var(--text-inverse))',
				},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
				pill: '9999px',
				sharp: '4px',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
