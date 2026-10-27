# OKTOPUS Clothing — Interactive Hanging T-Shirt Hero
## Architecture Audit & Implementation Feasibility Report

> **Document Type:** Pre-Implementation Architectural Audit & Feasibility Assessment  
> **Target Feature:** Desktop-Only Interactive Hanging T-Shirt Hero Section  
> **Status:** **READ-ONLY AUDIT COMPLETE — IMPLEMENTATION ON HOLD PENDING ASSET PREPARATION & AUTHORIZATION**  
> **Date:** October 26, 2026  
> **Project Root:** `/Users/apple/Desktop/oktopus_clothing-main 2`  
> **Target Route:** Landing Page (`/`, `src/app/page.tsx`) & Storefront (`/store`, `src/app/store/page.tsx`)

---

## 1. Executive Summary

### 1.1 Feasibility Verdict
**Technically Feasible, but Hard-Blocked on Asset Preparation.**

The proposed **Interactive Hanging T-Shirt Hero**—featuring a horizontal clothing rail with five to seven T-shirts suspended from individual hangers, resting at a narrow side-profile angle (`rotateY(78deg)`) and rotating smoothly to a front-facing preview (`rotateY(0deg)`) on hover or click selection—is **architecturally viable** within the current Next.js 15 / React 18 / Tailwind CSS / Framer Motion stack.

However, **it cannot be implemented with visual fidelity using the repository's current image assets as they exist today.**

### 1.2 The Core Technical & Visual Blocker
Every single product image currently stored in the MongoDB database and linked in the storefront is an **opaque RGB image with a solid white background (`#FFFFFF`, `hasAlpha: no`)** or a full-frame lifestyle model photograph. 

Because CSS 3D transforms rotate flat 2D image planes in 3D space, placing existing product images into a 3D rotation over the landing page's pure black background (`#000000`) will cause **solid white rectangular cards to rotate in space**, completely destroying the physical illusion of floating garments on a clothing rack. Furthermore, **zero hanger graphics, zero clothing rail graphics, and zero side-profile garment renders exist in the repository.**

### 1.3 Recommended Approach
1. **Decoupled Desktop Component:** Construct a self-contained `<DesktopHangingHero />` component using pure CSS 3D transforms (`perspective`, `rotateY`, `transform-style: preserve-3d`) orchestrated via Framer Motion 11 (already installed) or native CSS transitions.
2. **Strict Mobile Isolation:** Retain the existing mobile hero in its entirety without modifying a single line of mobile CSS or layout logic, using strict breakpoint encapsulation (`hidden md:block` for the new 3D hero; `block md:hidden` for the unchanged mobile view).
3. **No Heavy 3D Engines:** Avoid introducing Three.js, WebGL, or Canvas runtimes. The visual goal can be achieved with zero additional npm packages if transparent PNG/WebP garment cutouts and hanger assets are provided.

---

## 2. Verified Existing Architecture

*The following findings are verified through static inspection of configuration files, package manifests, and live dev server inspection on port 9002.*

### 2.1 Technology Stack & Tooling

| Layer | Verified Technology | Version | Location / Config |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.3.8` | [`package.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/package.json#L63) |
| **Runtime / UI** | React / React DOM | `18.3.1` | [`package.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/package.json#L68-L70) |
| **Language** | TypeScript | `^5` | [`tsconfig.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/tsconfig.json) |
| **Styling** | Tailwind CSS + `tailwindcss-animate` | `3.4.1` / `1.0.7` | [`tailwind.config.ts`](file:///Users/apple/Desktop/oktopus_clothing-main%202/tailwind.config.ts), [`postcss.config.mjs`](file:///Users/apple/Desktop/oktopus_clothing-main%202/postcss.config.mjs) |
| **UI Primitives** | Radix UI (`@radix-ui/react-*`) | `^1.2` / `^2.1` | [`package.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/package.json#L19-L39) |
| **Motion / Animation**| Framer Motion | `^11.2.10` | [`package.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/package.json#L56) |
| **Carousel** | Embla Carousel (`embla-carousel-react`) | `^8.6.0` | [`package.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/package.json#L49-L50) |
| **Icons** | Lucide React | `^0.490.0` | [`package.json`](file:///Users/apple/Desktop/oktopus_clothing-main%202/package.json#L60) |
| **Database** | MongoDB Native Client | `^6.8.0` | [`src/lib/mongodb.ts`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/lib/mongodb.ts) |
| **Image CDN** | Cloudinary, Amazon CDN, ImgBB, Imgur | Dynamic | [`next.config.ts`](file:///Users/apple/Desktop/oktopus_clothing-main%202/next.config.ts#L8-L85) |

### 2.2 Typography & Design System Tokens
- **Display Typography:** Google Font `Bebas Neue` imported in [`src/app/globals.css`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/globals.css#L2), mapped to utility class `font-bebas` in [`tailwind.config.ts`](file:///Users/apple/Desktop/oktopus_clothing-main%202/tailwind.config.ts#L25). Used for major headlines and editorial numbers.
- **Body Typography:** Google Font `Inter` (`--font-sans`) and `Archivo` (`--font-serif`) loaded via `next/font/google` in [`src/app/layout.tsx`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/layout.tsx#L35-L40).
- **Color Variables:** Multi-theme CSS variable architecture in [`src/app/globals.css`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/globals.css#L8-L174) with `default` (pure black `#000000` dark mode, yellow streetwear accent `#fcc324`), `pink`, and `slateBlue`.
- **Breakpoints:** Standard Tailwind configuration (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1400px`). The critical mobile/desktop boundary across the repository is consistently **`md` (768px)**.

### 2.3 Product Catalog Data Pipeline
- Products are stored in MongoDB collection `products` (65 total active products verified).
- API Route: [`src/app/api/products/route.ts`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/api/products/route.ts) supports `GET` (with optional search query `?q=` and `?category=`) and `POST`.
- Client Context: [`src/context/product-context.tsx`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/context/product-context.tsx) wraps the application inside [`src/app/layout.tsx`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/layout.tsx#L111) and provides `products`, `loading`, and helper functions.
- Static Seed File: [`src/data/products.ts`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/data/products.ts) is deprecated and contains an empty array.

---

## 3. Current Homepage and Hero Analysis

### 3.1 Two Disconnected "Landing" Experiences
Inspection reveals two distinct pages serving landing/storefront roles:

```
                                  ┌──────────────────────────────┐
                                  │      src/app/layout.tsx      │
                                  │   Global Providers & Theme   │
                                  └──────────────┬───────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             Route: "/" (Landing Splash)                      Route: "/store" (Storefront)
             src/app/page.tsx                                 src/app/store/page.tsx
       ┌───────────────────────────────┐               ┌─────────────────────────────────┐
       │ - 100vh full-screen splash    │               │ - Full multi-section ecommerce  │
       │ - Oktopus Header Logo         │               │ - Header / Navigation           │
       │ - 5 Fanned Cards (hardcoded)  │               │ - Desktop Hero: Parallax Banner │
       │ - Bebas Headline & Subtitle   │               │   with 3 Fanned Cards           │
       │ - "Enter Store" CTA button    │               │ - Mobile Hero: Embla Carousel   │
       │   leading to /store           │               │ - Categories, Bestsellers, etc. │
       └───────────────────────────────┘               └─────────────────────────────────┘
```

#### A. Dedicated Landing Page (`src/app/page.tsx` — Route `/`)
1. **Structure:** Client component (`LandingPage`) rendering a single viewport container with `bg-black text-white overflow-hidden flex flex-col justify-between`.
2. **Current Visual Hero:** A fan of five card elements positioned with fixed offsets and rotation:
   - Card 1: `left-[calc(50%-130px)] md:left-[calc(50%-320px)]`, `rotate: -12deg`, image `https://i.imgur.com/h0SjEpg.png`
   - Card 2: `left-[calc(50%-80px)] md:left-[calc(50%-190px)]`, `rotate: -6deg`, image `https://i.imgur.com/njNbmfx.jpeg`
   - Card 3 (Center): `left-1/2 -translate-x-1/2`, `rotate: 0deg`, image `https://i.ibb.co/k23QM5vt/pic-1.png`
   - Card 4: `right-[calc(50%-80px)] md:right-[calc(50%-190px)]`, `rotate: 6deg`, image `https://i.imgur.com/kDUL51T.jpeg`
   - Card 5: `right-[calc(50%-130px)] md:right-[calc(50%-320px)]`, `rotate: 12deg`, image `https://i.imgur.com/x9kLhGO.jpeg`
3. **Current Mobile Implementation:** On viewports under 768px, the exact same 5 cards are rendered but scaled down using Tailwind utility overrides (`w-[90px] h-[120px] md:w-[180px] md:h-[240px]`).
4. **Data Dependency:** Zero database coupling. Images, headline (*"T-Shirts That Stand Out!"*), and button (*"Enter Store"*) are hardcoded.

#### B. Main Storefront Page (`src/app/store/page.tsx` — Route `/store`)
1. **Structure:** Large component (`StreetifyStorePage`, 1014 lines) explicitly bifurcated at line 329 (`<div className="hidden md:block ...">`) and line 632 (`<div className="md:hidden ...">`).
2. **Desktop Hero (Section 1):** Two-column parallax layout:
   - Left Column: Editorial billboard with headline *"OKTOPUS CLOTHING"*, subtitle, *"EXPLORE CATALOG"*, and *"CUSTOM DESIGNS"* buttons.
   - Right Column: 3 fanned cards (`-15deg`, `0deg`, `15deg`) inside a `h-[440px]` container driven by mouse-move parallax (`data-layer`, `data-speed`).
3. **Mobile Hero:** A dedicated swipeable banner carousel utilizing `embla-carousel-react` and `embla-carousel-autoplay`.

### 3.2 Least Disruptive Integration Point
The user request states:
> *"A desktop landing-page hero featuring a horizontal clothing rail with approximately five to seven T-shirts hanging from individual hangers."*

The primary integration candidate is **`src/app/page.tsx` (Route `/`)**, which is explicitly titled `LandingPage` and already functions as the entry point with 5 fanned product cards. Replacing the central card stack in `src/app/page.tsx` on desktop elevates the initial brand arrival experience without altering the rest of the application.

*Alternative secondary candidate:* If the business considers `/store` the landing page, the feature would cleanly substitute the right column (or the entire Section 1 Hero Parallax Billboard) of `src/app/store/page.tsx` inside the existing `hidden md:block` desktop container.

---

## 4. Desktop-Only Implementation Strategy

### 4.1 Strict Viewport Isolation Architecture
To guarantee that the mobile experience is preserved with 100% fidelity, the integration must adopt strict **CSS breakpoint isolation**:

```tsx
/* Proposed Landing Page Layout in src/app/page.tsx */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between">
      {/* 1. Unchanged Top Logo */}
      <HeaderLogo />

      {/* 2. DESKTOP-ONLY HERO SECTION (>= 768px) */}
      <div className="hidden md:flex w-full flex-1 items-center justify-center my-6">
        <DesktopHangingHero />
      </div>

      {/* 3. MOBILE-ONLY HERO SECTION (< 768px) - 100% UNCHANGED */}
      <div className="flex md:hidden relative w-full h-[320px] items-center justify-center my-6">
        {/* Existing 5 fanned cards preserved exactly as they exist today */}
        <MobileLegacyCardStack />
      </div>

      {/* 4. Bottom Typography & Store Action */}
      <BottomTypographyAndCTA />
    </div>
  );
}
```

### 4.2 Why This Strategy Guarantees Zero Mobile Regressions
1. **Zero CSS Leakage:** All 3D perspective styles (`perspective`, `transform-style: preserve-3d`, `rotateY`, `transform-origin`) are encapsulated within `.hidden.md\:flex`. Because `display: none` is applied below 768px, mobile browsers do not construct render layers or calculate 3D matrix transforms for the desktop hero.
2. **Zero Interaction Conflicts:** Mouse event listeners (`onMouseEnter`, `onMouseLeave`, `onMouseMove`) and click handlers for 3D pinning are bound strictly to desktop DOM nodes. Mobile touch events (`touchstart`, `touchmove`, `touchend`) are completely isolated.
3. **Bandwidth Optimization on Mobile:** In a production implementation, the desktop component can be dynamically imported with `ssr: false` or conditionally mounted using a viewport check if asset payload sizes warrant it, ensuring mobile devices download zero desktop 3D assets.

---

## 5. Existing Asset Audit

A comprehensive inspection of local assets in `/public` and remote assets registered in MongoDB was executed.

### 5.1 Local Repository Files (`/public`)
Only five image files exist locally in `/public`:
- [`/public/logo1.png`](file:///Users/apple/Desktop/oktopus_clothing-main%202/public/logo1.png): 86.9 KB, 800x267, PNG with Alpha. (Site logo).
- [`/public/logo2b.png`](file:///Users/apple/Desktop/oktopus_clothing-main%202/public/logo2b.png): 28.7 KB, PNG with Alpha. (Black logo variant).
- [`/public/logo2w.png`](file:///Users/apple/Desktop/oktopus_clothing-main%202/public/logo2w.png): 26.5 KB, PNG with Alpha. (White logo variant).
- [`/public/adaptive-icon.png`](file:///Users/apple/Desktop/oktopus_clothing-main%202/public/adaptive-icon.png): 79.2 KB, PNG. (App icon).
- `.idx/icon.png`: 4.2 KB.

**Result:** Zero product assets, zero hanger graphics, zero rail assets exist locally.

### 5.2 Remote Product Image Asset Matrix
An inspection of active product records in MongoDB via the live dev API (`http://localhost:9002/api/products`) yielded the following asset classification:

| Asset Identifier | Source URL | Verified Dimensions | Verified Mode & Alpha | Visual Content | Suitability for 3D Hanging Hero |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Landing Card 1** | `https://i.imgur.com/h0SjEpg.png` | 180 × 240 px | RGB, `hasAlpha: no` | Eyewear model cutout on solid bg | **Unsuitable** (Thumbnail resolution, opaque) |
| **Landing Card 2** | `https://i.imgur.com/njNbmfx.jpeg` | 667 × 1000 px | RGB, `hasAlpha: no` | Studio model in streetwear | **Unsuitable** (Lifestyle photo, cannot hang) |
| **Landing Card 3** | `https://i.ibb.co/k23QM5vt/pic-1.png` | 240 × 320 px | RGB, `hasAlpha: no` | Low-res graphic model | **Unsuitable** (Low resolution) |
| **Landing Card 4** | `https://i.imgur.com/kDUL51T.jpeg` | 564 × 735 px | RGB, `hasAlpha: no` | Editorial photo | **Unsuitable** (Full photo plane) |
| **Landing Card 5** | `https://i.imgur.com/x9kLhGO.jpeg` | 1200 × 1500 px | RGB, `hasAlpha: no` | Editorial photo | **Unsuitable** (Full photo plane) |
| **Thor Graphic Tee (Front)** | `https://i.ibb.co/tMGTLrtq/test24-1.png` | 2160 × 2160 px | RGB, `hasAlpha: no` (pure `#FFFFFF` bg) | Flat-lay front view with inner tag | **Reusable after processing** (Must remove white background & drop shadow) |
| **Thor Tee (Model Shot)** | `https://i.ibb.co/xS5nHL35/test24-2.png` | 1920 × 1920 px | RGB, `hasAlpha: no` | Blonde female model wearing shirt | **Unsuitable** (Cannot be placed on hanger) |
| **Black Hulk Tee (Front)** | `https://m.media-amazon.com/images/X/bxt1/M/ebxt1R-RWB7sYZa.png` | 1920 × 1920 px | RGB (JPEG encoded), `hasAlpha: no` | Flat-lay front view with small chest logo | **Reusable after processing** (Must remove white background & duplicate entries) |
| **Feluda Black Tee (Back)** | `https://i.ibb.co/NdP4Kr24/OB-01B.png` | 1000 × 1000 px | RGB, `hasAlpha: no` (pure `#FFFFFF` bg) | Clean blank back view of oversized black tee | **Reusable after processing** (Suitable as generic black reverse face after background removal) |
| **Beige French Terry Tee** | `https://i.ibb.co/Lzp81hG4/new-model-01-copy.png` | 1080 × 1080 px | RGB, `hasAlpha: no` | Male model wearing beige tee | **Unsuitable** (Lifestyle model photography) |
| **Store Hero Card 2** | `https://i.ibb.co/23vrv2sM/Gemini-Generated-Image-4ytc2a4ytc2a4ytc.png` | 2048 × 2048 px | RGB, `hasAlpha: no` | AI streetwear model | **Unsuitable** (Not an isolated garment) |

### 5.3 Key Findings on Existing Product Imagery
1. **No Alpha Transparency:** Every product image has `hasAlpha: no`. When placed on the dark background of `src/app/page.tsx`, an unedited product image renders as a white square with sharp borders.
2. **Flat-Lay vs Hanging Drape:** The available front-view product mockups are **flat-lay garments photographed from directly above**. The inner back neckline and woven collar tag are visible inside the neck hole. On a real hanger, the back neck is obscured by the hanger hook, and the garment drapes downward under gravity.
3. **Duplicate Images in Catalog:** In 14 of the multi-image catalog entries inspected, multiple array elements point to identical image URLs (e.g., the Hulk Tee has five array entries pointing to duplicate URLs).
4. **Artwork Not Separated:** Artwork is flattened into the garment mockups. Vector graphics or raw transparent PNGs of the chest prints are not stored independently.

---

## 6. Missing Asset and Graphics Requirements

To achieve the physical hanging clothing rail effect, the following assets **must be created or prepared** before implementation can proceed:

### 6.1 Essential Prerequisite Assets (Blockers)

```
                       ┌─────────────────────────────────────────────────────────┐
                       │               HORIZONTAL CLOTHING RAIL                  │  <-- Asset 1: Rail Graphic
                       └──────┬───────────────────────────┬────────────────┬─────┘
                              │                           │                │
                        ┌─────┴─────┐               ┌─────┴─────┐    ┌─────┴─────┐
                        │  HANGER   │               │  HANGER   │    │  HANGER   │  <-- Asset 2: Hanger Graphic
                        └─────┬─────┘               └─────┬─────┘    └─────┬─────┘
                              │                           │                │
                        ┌─────┴─────┐               ┌─────┴─────┐    ┌─────┴─────┐
                        │  T-SHIRT  │               │  T-SHIRT  │    │  T-SHIRT  │  <-- Asset 3: Isolated Cutouts
                        │ FRONT CUT │               │ FRONT CUT │    │ FRONT CUT │      (Transparent WebP)
                        └───────────┘               └───────────┘    └───────────┘
```

1. **Clothing Rail Graphic (`rail.svg` or `rail.webp`):**
   - **Purpose:** The stationary horizontal bar across the top of the hero that supports the hangers.
   - **Specs:** SVG vector or transparent PNG/WebP (2400 × 40 px). Matte dark metallic (`#222222` to `#333333`) or brushed chrome finish matching the streetwear aesthetic. Must include subtle highlight along top edge.
2. **Individual Hanger Graphics (`hanger.svg` or `hanger.webp`):**
   - **Purpose:** Suspends each shirt. Must feature a hook at the top and contoured wooden/metal shoulder arms.
   - **Specs:** SVG or transparent PNG/WebP (500 × 220 px). Hook must terminate precisely at `y = 0` so the `transform-origin` pivot coincides with the contact point on the rail.
3. **Five to Seven (5–7) Transparent Front-View T-Shirt Cutouts:**
   - **Purpose:** The primary interactive garments.
   - **Specs:** 1000 × 1200 px, 32-bit RGBA (WebP format recommended, < 120 KB each).
   - **Preparation Requirements:**
     - Background `#FFFFFF` and existing studio drop shadows completely removed.
     - Neck opening retouched: the hollow inner neck hole must accommodate the hanger shoulder bar without visual clashes.
     - Consistent shoulder height, garment scale, and vertical centering across all 5–7 shirts.
4. **Reverse-Face / Back-View Garment Cutouts (Minimum 1 per colorway):**
   - **Purpose:** Displayed when rotating through the rear 180° plane or when viewing the back of the hanger.
   - **Specs:** Same dimensions and alignment as front cutouts. Can be shared across shirts of the same base fabric color (e.g., one generic black back cutout, one navy back cutout, one white back cutout).

### 6.2 Optional Visual Enhancements (Non-Blocking)
- **Dynamic Floor Shadow:** Soft elliptical radial gradient (`blur(24px)`, opacity `0.4`) beneath each garment that compresses horizontally when the shirt is at `78deg` and widens when it rotates to `0deg`.
- **Fabric Depth Bevel (Pseudo 3D Edge):** A 1.5px vertical gradient strip at the outer edge to simulate a 3-millimeter cotton hem during oblique rotation.

---

## 7. CSS 3D Technical Feasibility

### 7.1 Geometry & Mathematical Assembly

```
                       Rail Contact Point (Hook Pivot)
                                (50% 0px 0px)
                                      ▲
                                      │  transform-origin: top center
                      ┌───────────────┴───────────────┐
                      │          Hanger Hook          │
                      │       Contoured Shoulders     │
                      ├───────────────────────────────┤
                      │                               │
                      │      Front Face (rotateY 0°)  │  <-- Visible on hover/click
                      │                               │
                      │      Back Face (rotateY 180°) │  <-- backface-visibility: hidden
                      │                               │
                      └───────────────────────────────┘
                                      │
                         Rotation Axis (Y-Axis Pivot)
```

1. **Scene Perspective:**
   The parent hero container must establish a 3D perspective context:
   ```css
   .hero-3d-scene {
     perspective: 1500px;
     perspective-origin: 50% 35%;
   }
   ```
   *Rationale:* `1500px` provides realistic telephoto foreshortening. A low perspective (< 800px) causes extreme barrel distortion at screen edges; a high perspective (> 2500px) flattens 3D depth into an orthographic projection.
2. **Transform Origin & Anchor Physics:**
   To ensure the hanger hook remains physically locked to the rail during rotation, the pivot point must be set to the hook apex:
   ```css
   .hanging-garment-assembly {
     transform-origin: 50% 0px 0px; /* Pivots around hook apex */
     transform-style: preserve-3d;
     transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
   }
   ```
   *Critical Risk:* If `transform-origin` defaults to `center center` (`50% 50%`), the hook will swing in an arc across the rail like a pendulum whenever the shirt rotates.
3. **Rotation State Angles:**
   - **Default Rest Angle:** `transform: rotateY(78deg);`
     - Perceived visual width: $\cos(78^\circ) \approx 0.208$ (approx. 21% of full garment width).
     - Allows 5–7 shirts to hang side-by-side in a compact horizontal span of ~800–1000px without clipping.
   - **Active (Hovered / Pinned) Angle:** `transform: rotateY(0deg) translateZ(60px);`
     - Full front view facing the camera directly.
     - `translateZ(60px)` brings the active garment forward in 3D space, preventing visual clipping through neighboring angled shirts.

### 7.2 Optical Artifacts of Pure CSS 3D & Mitigations

| Optical Challenge | Root Cause | Visible Artifact | Recommended Mitigation |
| :--- | :--- | :--- | :--- |
| **Paper-Thin Silhouette** | CSS planes have `0px` Z-depth | At 78° or grazing angles, the garment looks like a paper cutout with zero fabric volume. | 1. Limit max rest rotation to `76°–78°` so front artwork edge is still discernible.<br>2. Add an internal shadow gradient (`linear-gradient(to right, rgba(0,0,0,0.4), transparent)`) that fades in at high angles.<br>3. Optional: Add a 2px pseudo-element side slice. |
| **Z-Clipping / Interpenetration** | Adjacent garments spaced 100px apart will collide when one expands from 60px to 280px width | Garment slices through the adjacent shirt during rotation. | 1. Elevate active shirt via `translateZ(60px)`.<br>2. Dynamically assign `z-index: 30` to hovered/pinned shirt and `z-index: 10` to dormant shirts.<br>3. Slightly spread adjacent dormant shirts outward by 15px using `translateX`. |
| **Backface Mirroring** | Default CSS mirrors reverse face | If shirt rotates past 90°, text or logos appear reversed. | Apply `backface-visibility: hidden;` to front plane. Back plane is rendered as a separate child with `transform: rotateY(180deg); backface-visibility: hidden;`. |
| **Subpixel Text/Print Shimmer** | GPU texture filtering on rotated subpixel planes | Fine lines in chest graphics shimmer or blur during rotation in WebKit/Blink. | Apply `-webkit-font-smoothing: subpixel-antialiased; transform: translateZ(0);` and render high-resolution 2x assets downscaled. |

---

## 8. Interaction State and Animation Design

### 8.1 State Machine

```
                            [ User Enters Hero ]
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │   All Dormant (78°) │
                          │   pinnedId: null    │
                          │   hoveredId: null   │
                          └──────────┬──────────┘
                                     │
             ┌───────────────────────┴───────────────────────┐
             │ Hover Shirt B                                 │ Click Shirt A
             ▼                                               ▼
  ┌─────────────────────┐                         ┌─────────────────────┐
  │   Hover Preview     │                         │   Pinned Selection  │
  │   hoveredId: "B"    │                         │   pinnedId: "A"     │
  │   Shirt B: 0°       │                         │   Shirt A: 0°       │
  │   Others: 78°       │                         │   Others: 78°       │
  └──────────┬──────────┘                         └──────────┬──────────┘
             │                                               │
             │ Pointer Leaves                                │ Hover Shirt C
             ▼                                               ▼
  ┌─────────────────────┐                         ┌─────────────────────┐
  │   All Dormant       │                         │   Priority Override │
  │   Reverts to null   │                         │   hoveredId: "C" (0°)│
  └─────────────────────┘                         │   pinnedId: "A"     │
                                                  │   Shirt A: 78° (temp)
                                                  └──────────┬──────────┘
                                                             │
                                                             │ Pointer Leaves C
                                                             ▼
                                                  ┌─────────────────────┐
                                                  │   Restored Pin      │
                                                  │   hoveredId: null   │
                                                  │   Shirt A: 0° (pin) │
                                                  └─────────────────────┘
```

1. **State Ownership:**
   ```ts
   interface HangingHeroState {
     pinnedId: string | null;    // Persistently selected item
     hoveredId: string | null;   // Temporarily hovered item
     activeId: string | null;    // Computed: hoveredId ?? pinnedId
   }
   ```
2. **Priority Resolution:**
   - Active displayed front shirt is **`hoveredId ?? pinnedId`**.
   - If Shirt A is pinned (front-facing) and user hovers over Shirt C, Shirt C smoothly rotates to `0°` and Shirt A returns to `78°`. When the pointer leaves Shirt C, Shirt C returns to `78°` and Shirt A immediately restores to `0°`.
3. **Selection Clearing:**
   - Clicking an already-pinned shirt unpins it (`pinnedId = null`), returning all shirts to rest.
   - Pressing `Escape` on the keyboard clears the pinned selection.
   - Clicking the background outside any garment clears the pinned selection.
4. **Keyboard Operability:**
   - Shirts are wrapped in semantic `<button>` elements with `role="tab"` or `role="radio"`.
   - `Tab` / `Shift+Tab`: Focuses sequential hangers.
   - `Enter` / `Space`: Pins the focused shirt.
   - `ArrowLeft` / `ArrowRight`: Moves focus and immediately previews the next/previous shirt.
   - `Escape`: Deselects.
5. **Reduced Motion Mode (`prefers-reduced-motion: reduce`):**
   - In accordance with WCAG 2.1 Criterion 2.3.3:
   - 3D rotations (`rotateY(78deg) -> rotateY(0deg)`) are disabled.
   - Inactive shirts are rendered at an opacity of `0.4` and standard 2D layout.
   - Selecting a shirt crossfades opacity from `0.4` to `1.0` and scales slightly (`1.05`) without 3D rotation.

---

## 9. Recommended Component Architecture

### 9.1 File Structure & Locations
All proposed files fit cleanly into existing architectural conventions without altering global configuration:

```
src/
├── components/
│   └── hero/
│       ├── desktop-hanging-hero.tsx    <-- Primary container with rail & scene
│       ├── hanging-tee-item.tsx        <-- Individual 3D hanger + garment assembly
│       ├── hanging-hero-details.tsx    <-- Selected product info, price, and CTA
│       ├── hanging-hero.types.ts       <-- TypeScript interfaces & state definitions
│       └── hanging-hero.constants.ts   <-- Initial rotation, spring stiffness, default products
```

### 9.2 Component Boundaries & Props Contracts

```ts
// src/components/hero/hanging-hero.types.ts
export interface HangingProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  frontImageUrl: string;     // Transparent cutout PNG/WebP
  backImageUrl?: string;     // Optional back cutout PNG/WebP
  productUrl: string;        // Destination link (e.g. /products/[id])
  colorName?: string;
  badge?: string;            // e.g. "HEAVYWEIGHT", "EXCLUSIVE"
}

export interface DesktopHangingHeroProps {
  products?: HangingProduct[];
  headline?: string;
  subtitle?: string;
  className?: string;
}
```

### 9.3 State Flow & Props Drilling Prevention
- **Container (`desktop-hanging-hero.tsx`):** Holds `pinnedId` and `hoveredId` in local React state. Passes `isActive` boolean and rotation angle down to `<HangingTeeItem />`.
- **Garment (`hanging-tee-item.tsx`):** Pure presentation component receiving `product`, `isHovered`, `isPinned`, `isActive`, `index`, and event callbacks (`onHoverStart`, `onHoverEnd`, `onSelect`).
- **Details Strip (`hanging-hero-details.tsx`):** Displays title, price, and "VIEW PRODUCT" button linked to `activeProduct.productUrl`.

---

## 10. Performance and Accessibility

### 10.1 Performance Budget & Targets

| Metric | Target | Technical Mechanism |
| :--- | :--- | :--- |
| **Animation Frame Rate** | 60 fps (16.6ms) solid | All animations run strictly on compositor thread via `transform: rotateY()` and `opacity`. Zero layout recalculation or repaint. |
| **First Contentful Paint (FCP)** | < 1.2s | Hero rail SVG and top 5 garment cutouts preload using Next.js `priority` attribute. |
| **Cumulative Layout Shift (CLS)** | 0.000 | Container dimensions (`h-[480px]`, `w-full max-w-5xl`) are explicitly reserved in CSS prior to image load. |
| **Total Asset Payload** | < 600 KB total | 5–7 WebP garment cutouts (~70KB each) + rail & hanger SVGs (~15KB) = ~450KB total. |
| **Memory Footprint** | Low (< 30 MB GPU) | Avoids permanent `will-change: transform`. `will-change` is toggled only on `:hover` or `:focus`. |

### 10.2 Accessibility (a11y) Conformance Matrix

| Requirement | Implementation Pattern | WCAG Criterion |
| :--- | :--- | :--- |
| **Keyboard Operability** | Interactive shirts are rendered as `<button role="tab" aria-selected={isActive} aria-controls="selected-product-panel">` | 2.1.1 Keyboard (Level A) |
| **Visible Focus Indicator** | Explicit outline ring: `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black` | 2.4.7 Focus Visible (Level AA) |
| **Screen Reader Announcement** | When `activeId` changes, an invisible `aria-live="polite"` element announces: *"Selected: [Product Name], ₹[Price]"* | 4.1.3 Status Messages (Level AA) |
| **Color & Contrast** | Text on black background uses pure white (`#FFFFFF`) and warm gray (`#A1A1AA`), meeting 15:1 to 21:1 contrast ratios. | 1.4.3 Contrast (Minimum) (Level AA) |
| **Motion Sensitivity** | Evaluates `@media (prefers-reduced-motion: reduce)` via Framer Motion's `useReducedMotion()`. 3D spins become static crossfades. | 2.3.3 Animation from Interactions (Level AAA) |

---

## 11. Risks and Alternatives

### 11.1 Comparison of Technical Rendering Approaches

| Criterion | Option A: Pure CSS 3D (Recommended) | Option B: Pre-Rendered Frame Sequence (Spritesheet) | Option C: 3D WebGL / Three.js / Spline |
| :--- | :--- | :--- | :--- |
| **Visual Realism** | High if transparent cutout is cleanly prepared. Flat plane at extreme angle. | Very High (Photorealistic turnaround of actual cloth). | Highest (True fabric physics, cloth drape, dynamic light). |
| **Bundle Size Overhead** | **0 KB** (Uses existing CSS & Framer Motion). | ~10 KB JS + 2–4 MB spritesheet per garment. | **+400 KB to +900 KB** (Three.js / WebGL engine). |
| **Asset Requirements** | 1 front cutout + 1 back cutout + hanger. | 24–36 pre-rendered photography frames per garment. | 3D mesh (.GLB/.GLTF) + PBR textures per garment. |
| **Initial Load Impact** | Fast (WebP cutouts load via standard CDN). | Slow (Preloading dozens of frames causes network lag). | Heavy (Shader compilation, WebGL context creation). |
| **Mobile Degradation Risk**| **Zero** (Pure desktop CSS). | Low (Can fall back to single image). | High (GPU contention, battery drain if not isolated). |
| **Implementation Effort** | **3–4 Days** once assets exist. | 2–3 Weeks (Requires turntable studio photography). | 3–4 Weeks (Requires 3D cloth modeling and rigging). |

### 11.2 Conditions Under Which Alternatives Would Be Justified
- **Option B (Sprite Sequence)** is justified if the brand insists on showing the true wrinkle displacement and seam thickness of a 240 GSM heavy cotton tee as it rotates, and studio turntable photography is available.
- **Option C (Three.js / WebGL)** is justified only if OKTOPUS plans to offer full 360° interactive 3D customization (e.g. placing custom graphics onto a 3D cloth model in real time on the landing page).

---

## 12. Implementation Plan

> **NOTE:** In accordance with the `AUDIT_ONLY_NO_IMPLEMENTATION` instruction, this plan is **NOT** to be executed at this stage. It serves solely as a structured roadmap for future authorization.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Phase A: Graphic Asset Preparation (Prerequisite Blocker)            │
│  - Isolate 5-7 front garment cutouts (transparent WebP)               │
│  - Render hanger SVG with top-center hook anchor                       │
│  - Render clothing rail horizontal asset                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase B: Isolated Component Prototype & 3D Math Validation           │
│  - Build src/components/hero/desktop-hanging-hero.tsx                  │
│  - Calibrate transform-origin, perspective (1500px), and rotateY (78°) │
│  - Validate z-elevation (translateZ) and hover/click priority state    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase C: Landing Page Integration & Breakpoint Encapsulation         │
│  - Integrate into src/app/page.tsx behind .hidden.md\:flex             │
│  - Ensure mobile legacy cards remain 100% untouched behind .md\:hidden │
│  - Connect active product metadata to CTA action                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase D: Accessibility & Reduced Motion Hardening                     │
│  - Implement WAI-ARIA tab/radio keyboard navigation (Tab/Arrows/Enter) │
│  - Add prefers-reduced-motion fallback                                 │
│  - Add aria-live status region for screen readers                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase E: Cross-Browser Validation & Mobile Regression Sweep          │
│  - Test Safari/WebKit 3D rendering & subpixel anti-aliasing            │
│  - Test Chromium & Firefox perspective consistency                     │
│  - Verify zero changes to mobile layout, touch, or performance         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Acceptance Criteria & Regression Tests

### 13.1 Acceptance Criteria for the Desktop Hanging Hero
1. **Initial Display:** On desktop viewports ($\ge 768\text{px}$), five to seven shirts hang vertically from a clothing rail, resting at an oblique side angle between $75^\circ$ and $80^\circ$.
2. **Anchor Stability:** The hanger hook remains stationary on the rail during all phases of rotation. The hook does not disconnect, wobble, or translate horizontally.
3. **Hover Interaction:** Hovering over any garment smoothly rotates it to $0^\circ$ (front-facing) within 450–600ms, revealing the complete front graphic without distortion or mirroring.
4. **Click / Pin Interaction:** Clicking a garment pins it in the $0^\circ$ front-facing position. Pointer exit does not revert a pinned garment.
5. **Selection Priority:** If Shirt A is pinned and the user hovers over Shirt B, Shirt B rotates to $0^\circ$ while Shirt A temporarily returns to rest. When the pointer leaves Shirt B, Shirt A smoothly returns to $0^\circ$.
6. **Clearing Pin:** Clicking a pinned shirt, clicking the hero background, or pressing `Escape` clears the pinned selection, returning all shirts to rest.
7. **Keyboard Accessibility:** All garments can be reached and focused via `Tab`. Pressing `Enter` or `Space` pins the focused garment. Arrow keys navigate between garments.
8. **Reduced Motion:** If `prefers-reduced-motion: reduce` is enabled, 3D rotations are disabled in favor of subtle opacity/scale transitions.

### 13.2 Mandatory Mobile Regression Test Suite
1. **Viewport Verification (< 768px):** Verify on mobile screen sizes (375px, 390px, 412px) that the existing mobile landing page UI renders identically to the current production build.
2. **Zero 3D Elements on Mobile:** Ensure no 3D transform layers, hangers, rails, or desktop event listeners are instantiated on mobile.
3. **Touch Scrolling:** Ensure vertical touch scrolling on mobile is 100% fluid and unaffected by horizontal gesture captures.
4. **Store Functionality Unaffected:** Verify that navigating to `/store`, adding items to the cart, opening the mobile drawer, and checkout remain completely operational.

---

## 14. Readiness Decision

### Status: **READY AFTER ASSET PREPARATION**

```
┌────────────────────────────────────────────────────────────────────────┐
│                         READINESS CHECKLIST                            │
├────────────────────────────────────────────────────────────┬───────────┤
│ 1. Next.js 15 & React 18 Architecture Compatibility         │  PASSED   │
│ 2. Tailwind CSS & Responsive Breakpoint Infrastructure     │  PASSED   │
│ 3. Framer Motion Animation Engine Availability             │  PASSED   │
│ 4. Mobile Layout Isolation Strategy                        │  PASSED   │
│ 5. Transparent PNG/WebP Garment Cutout Assets (5–7 units)  │  BLOCKED  │
│ 6. Transparent Clothing Rail & Hanger Vector/WebP Graphics │  BLOCKED  │
│ 7. Final Stakeholder Approval on Target Route (/ vs /store)│  PENDING  │
└────────────────────────────────────────────────────────────┴───────────┘
```

### Action Required Before Implementation Authorization:
1. **Prepare Garment Cutouts:** Deliver 5 to 7 high-resolution (min. 1000 × 1200 px) transparent PNG or WebP cutouts of OKTOPUS T-shirts with white backgrounds and drop shadows removed.
2. **Deliver Hanger & Rail Graphics:** Supply `hanger.svg` (anchored at `50% 0px`) and `rail.svg`.
3. **Confirm Route Selection:** Confirm whether the hero is to be integrated on **Route `/`** ([`src/app/page.tsx`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/page.tsx)) or **Route `/store`** ([`src/app/store/page.tsx`](file:///Users/apple/Desktop/oktopus_clothing-main%202/src/app/store/page.tsx)).

*No code changes or production modifications will occur until explicit authorization and asset deliverables are received.*
