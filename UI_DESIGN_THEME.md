# Oktopus Clothing - UI Design & Theme Reference

This document provides a comprehensive overview of the design system, themes, typography, and visual aesthetics of the **Oktopus Clothing** web application. It is designed to help another LLM understand and conform to the project's frontend design patterns.

---

## 1. Typography & Hierarchy
* **Headlines / Title Display**: Uses **`Bebas Neue`** (imported from Google Fonts). Typically used for hero banners, collection headers, and uppercase display tags.
* **Body Font**: Integrates **`Inter`** (sans-serif) for clean, readable secondary typography, and **`Archivo`** (serif) for custom navigation/site brand items.
* **Font Family Classes**: 
  - `font-sans` maps to the Inter-based sans-serif stack.
  - `font-serif` maps to the Archivo-based serif stack.
  - `font-bebas` is used for bold uppercase street fashion typography.

---

## 2. Color Palettes & Multi-Theme Config
The application supports a custom multi-theme system (`default`, `pink`, `slateBlue`) mapped to light/dark modes using Tailwind variable mappings inside `src/app/globals.css`:

### A. Default Theme
* **Light Mode**:
  - Background: Light Gray (`#F5F5F5` / `240 5% 96%`)
  - Foreground / Text: Charcoal (`240 10% 3.9%`)
  - Buttons / Primary Actions: Solid Dark (`240 10% 3.9%`)
* **Dark Mode**:
  - Background: Pure Black (`#000000` / `0 0% 0%`)
  - Foreground / Text: Soft White (`0 0% 98%`)
  - Buttons / Accents: Vibrant Streetwear Yellow (`48 96% 59%` / `#fcc324`)

### B. Pink Theme (`data-theme="pink"`)
* **Light Mode**:
  - Background: Light pastel pink (`#ffccd5` / `350 100% 90%`)
  - Foreground / Text: Dark pink (`345 50% 15%`)
  - Buttons / Primary: Stronger neon/accent pink (`348 83% 62%`)
* **Dark Mode**:
  - Background: Dark magenta/reddish-pink (`345 35% 12%`)
  - Foreground / Text: Soft pinkish-white (`345 50% 98%`)
  - Buttons / Primary: Light pink (`350 100% 90%`)

### C. Slate Blue Theme (`data-theme="slateBlue"`)
* Inherits the default background mappings with specialized slate accents for specific page widgets.

---

## 3. UI Aesthetics & Effects
* **Glassmorphism (`.card-glass`)**: 
  - Applies translucent backgrounds with heavy backdrop blurs (`backdrop-blur-lg`) and borders:
    - *Light Mode*: `bg-white/60 border-white/20`
    - *Dark Mode*: `bg-background/60 border-white/10`
  - Extensively used for mobile layout widgets and store dialogs.
* **Micro-Animations**:
  - Hover Zoom: Clothing and fashion grids apply `transition-transform duration-300 ease-in-out hover:scale-110` or `group-hover:scale-105`.
  - Floating Layers: Floating SVG grid doodles (`.animate-float`) on the streetify catalog home page to create a modern parallax look.
  - Checkmark Circle: SVG checkmark animations (`.checkmark`) on successful cart checkout or order validation.
* **Page Transitions**: Custom Framer Motion wrapper configurations (`framer-motion-wrapper.tsx`) providing page load slide/fade transitions.

---

## 4. Component Layout Conventions
* **Multiple Headers/Footers**: Custom header/footer components are provided for specific aesthetic catalogs (`streetify-header`, `dolenga-header`, `oktopus-header`). They adapt dynamically based on page layouts or settings.
* **Responsive Layouts**:
  - Mobile layout relies on navigation bars, overlay drawers, and `.md:hidden` configurations.
  - Desktop layout utilizes wide grids, sticky headers (`sticky top-0 z-50`), and clean hover lists.
