Design System — Waterloo Works

Purpose
- Centralize typography, spacing, and surface styles.
- Enforce two-font system: header and body.
- Use classes only — no component wrappers for DS.

Fonts
- Header: "205 Tf Exposure 0", Georgia, serif → Tailwind `font-header`
- Body: Neuehaasgroteskdisplay, Arial, sans-serif → Tailwind `font-body`

Type Tokens (tailwind.config.ts)
- Letter spacing:
  - `tracking-wide-01` → .01em (body)
  - `tracking-tight-02` → -0.02em (h3)
  - `tracking-tight-04` → -0.04em (h2)
- Line height:
  - `leading-heading` → 1
  - `leading-body` → 1.2
- Sizes:
  - `text-h2` → 3rem/1 400
  - `text-h3` → 2.25rem/1 400

Color Tokens
- `--base-color-brand--10` maps to Tailwind `background`
- `--base-color-brand--03` maps to Tailwind `foreground`

Utilities (classes)
- Card: `.ds-card` → `rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300`
- Divider: `.ds-divider` → `border-t border-zinc-200`
- Chip: `.ds-chip` → `rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm`

Global Defaults (app/globals.css)
- `body`: font-body, `.01em` tracking, 1.2 line-height
- `h3`: header font, -0.02em, 36/1
- `.heading-style-h2`: header font, -0.04em, 48/1

Usage Guidance
- Use Tailwind tokens directly for headings/body/surfaces.
- Use `.ds-card`, `.ds-chip`, `.ds-divider` for common surfaces/elements.
- Avoid `font-serif`/`font-sans` directly; use `font-header`/`font-body`.

Next Steps
- Self-host fonts under `public/fonts` and wire with `next/font/local`.
- Migrate pages to `Heading`/`Text` incrementally.
- Add tokens/variants for buttons and inputs after audit.
