# Pixel Art Resources for RECTOR LABS

**Purpose:** Curated list of free pixel art assets for rectorspace.com design

**Updated:** 2025-11-03
**License:** All resources are free/CC0 licensed

---

## Recommended Icon Packs

### 1. Kenney Assets (kenney.nl)

**Best Packs for Our Use:**
- **Input Prompts** - UI elements, buttons, controls
- **Game Icons** - 16x16 game icons (can be repurposed for sections)
- **UI Pack** - Interface elements, dividers, decorations

**Link:** https://kenney.nl/assets
**License:** CC0 (Public Domain)
**Format:** PNG, SVG available
**Why:** Professional quality, consistent style, massive library

### 2. Pixel Art App Icons by Reff Pixels (itch.io)

**Contains:** 130+ app icons in pixel art style
**Size:** Likely 32x32 or 64x64
**Link:** Search "Pixel Art App Icons" on itch.io
**Use Case:** Section headers (portfolio, labs, journal icons)
**License:** Free (check specific license on page)

### 3. Micro Roguelike by Kenney

**Contains:** Tiny 16x16 pixel art characters, objects, UI
**Link:** https://kenney.nl/assets/micro-roguelike
**Use Case:** Tiny decorative elements, dividers
**Format:** PNG spritesheet + individual files
**License:** CC0

### 4. 1-Bit Pack by Kenney

**Contains:** Minimal 1-bit (black/white) graphics
**Link:** https://kenney.nl/assets/1-bit-pack
**Use Case:** Ultra-minimal icons, easy to recolor to our palette
**Format:** PNG
**License:** CC0
**Why:** Easy to customize to Deep Brown (#3B2C22) or any color

---

## Specific Icons Needed

### Section Icons (32x32px)

| Section | Icon Concept | Source |
|---------|--------------|--------|
| Portfolio | Folder/briefcase | Kenney UI Pack |
| Labs | Flask/beaker | Kenney Game Icons |
| Journal | Book/pencil | Kenney Game Icons |
| Cheatsheet | Document/notes | Kenney UI Pack |
| Dakwa | Crescent moon | Custom or search itch.io |
| Quran | Open book | Custom or search itch.io |

### Decorative Elements (16x16px)

- **Dividers:** Pixel art horizontal lines, dots, dashes
- **Bullets:** Stars, diamonds, arrows
- **Accents:** Tiny decorations for headers

### UI Elements

- **Arrows:** Left/right for navigation (← →)
- **External link:** Up-right arrow (↗)
- **Loading:** Pixel art spinner
- **404:** Sad face or broken page icon

---

## How to Download & Use

### Kenney Assets

1. Visit https://kenney.nl/assets
2. Browse "UI" or "2D" categories
3. Click pack → "Download now"
4. Extract ZIP → grab needed icons
5. Place in `/app/assets/images/icons/`

### itch.io Assets

1. Visit https://itch.io/game-assets/free/tag-icons
2. Search specific packs (e.g., "Pixel Art App Icons")
3. Click pack → "Download Now" (usually free/name-your-price)
4. Extract → select icons
5. Place in `/app/assets/images/icons/`

---

## Customization Guide

### Recoloring to Our Palette

**Goal:** Match icons to RECTOR LABS color palette

**Tools:**
- **Pixelmator Pro** (macOS) - Easy pixel art editing
- **Aseprite** - Professional pixel art editor ($19.99)
- **GIMP** - Free, powerful (learning curve)
- **Photopea** - Free web-based (Photoshop alternative)

**Process:**
1. Open icon in editor
2. Select color (e.g., pure black)
3. Replace with Deep Brown (#3B2C22)
4. Replace other colors with palette colors
5. Export as PNG-8 (small file size)

**Example Color Mapping:**
- Black → Deep Brown (#3B2C22)
- White → Soft Cream (#FFF7E1)
- Blue → Sky Blue (#41CFFF)
- Yellow → Warm Yellow (#F9C846)
- Green → Leaf Green (#A8E063)

### Size Guidelines

**Web Display:**
- 16x16px → Display at 16px or 24px (upscaled)
- 32x32px → Display at 32px or 48px (upscaled)
- 64x64px → Display at 64px

**Upscaling:** Use `image-rendering: pixelated;` in CSS to preserve crisp edges

```css
.pixel-icon {
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
}
```

---

## Implementation Examples

### Section Header with Icon

```html
<h2 class="flex items-center gap-3 text-2xl font-bold text-brown mb-4">
  <img src="/assets/images/icons/portfolio.png"
       alt=""
       class="w-8 h-8 pixel-icon" />
  ## Portfolio
</h2>
```

### Pixel Art Divider

```html
<div class="flex justify-center my-12">
  <img src="/assets/images/dividers/dots.png"
       alt=""
       class="h-4 pixel-icon opacity-50" />
</div>
```

### Custom Bullet Points

```html
<ul class="space-y-2">
  <li class="flex items-start gap-2">
    <img src="/assets/images/icons/arrow.png"
         alt=""
         class="w-4 h-4 mt-1 pixel-icon" />
    <span>List item text</span>
  </li>
</ul>
```

---

## Alternative: Text-Based Icons

If pixel art doesn't work, use **Unicode/Emoji** as fallback:

```html
<!-- Section Headers -->
<h2>💼 Portfolio</h2>
<h2>🧪 Labs</h2>
<h2>📝 Journal</h2>
<h2>📚 Cheatsheet</h2>
<h2>🌙 Dakwa</h2>
<h2>📖 Quran</h2>

<!-- Dividers -->
<p class="text-center text-yellow text-2xl my-12">• • •</p>

<!-- Links -->
<a href="#">View More →</a>
<a href="#">GitHub ↗</a>
```

**Pros:**
- No image loading
- Scales perfectly
- Easy to implement
- Accessible

**Cons:**
- Less unique personality
- Not pixel art aesthetic
- Inconsistent across platforms

---

## Quick Start Recommendation

**Phase 1: Launch with Minimal Graphics**
1. Use text-based icons (emoji/unicode) for now
2. Focus on color + typography
3. Get content live first

**Phase 2: Add Pixel Art (Post-Launch)**
1. Download Kenney 1-Bit Pack (easiest to customize)
2. Recolor 6-8 icons for sections
3. Add 2-3 divider variations
4. Test and iterate

**This approach:** Ship fast, enhance later. Content > graphics initially.

---

## File Organization

```
app/assets/images/
├── icons/
│   ├── portfolio.png       (32x32)
│   ├── labs.png            (32x32)
│   ├── journal.png         (32x32)
│   ├── cheatsheet.png      (32x32)
│   ├── dakwa.png           (32x32)
│   └── quran.png           (32x32)
├── dividers/
│   ├── dots.png            (128x16)
│   ├── line.png            (128x4)
│   └── pattern.png         (128x16)
└── ui/
    ├── arrow-right.png     (16x16)
    ├── arrow-left.png      (16x16)
    ├── external-link.png   (16x16)
    └── spinner.png         (32x32)
```

---

## Resources

**Download Sites:**
- [Kenney Assets](https://kenney.nl/assets) - Professional, CC0
- [itch.io Pixel Art](https://itch.io/game-assets/free/tag-pixel-art) - Community assets
- [OpenGameArt.org](https://opengameart.org) - Open source game art
- [Lospec](https://lospec.com/pixel-art-tutorials) - Pixel art tutorials + palettes

**Editing Tools:**
- [Aseprite](https://www.aseprite.org) - Best pixel art editor ($19.99)
- [Pixelmator Pro](https://www.pixelmator.com/pro/) - macOS graphics ($49.99)
- [GIMP](https://www.gimp.org) - Free, cross-platform
- [Photopea](https://www.photopea.com) - Free web-based

**Color Tools:**
- [Lospec Palette List](https://lospec.com/palette-list) - Pre-made pixel art palettes
- [Coolors](https://coolors.co) - Extract colors from images

---

## License Attribution

**Kenney Assets:**
```
Icons by Kenney (kenney.nl)
License: CC0 (Public Domain)
```

Add to your site footer or credits page (optional, but good practice).

---

## Action Items

- [ ] Download Kenney 1-Bit Pack
- [ ] Download Kenney UI Pack
- [ ] Select 6 icons for main sections
- [ ] Recolor to Deep Brown (#3B2C22)
- [ ] Export as PNG-8
- [ ] Place in `/app/assets/images/icons/`
- [ ] Test in browser (check crispness)
- [ ] Add CSS `image-rendering: pixelated;`
- [ ] Document attribution

---

**Maintainer:** RECTOR | **Updated:** 2025-11-03

**May Allah make this design beautiful and user-friendly. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
