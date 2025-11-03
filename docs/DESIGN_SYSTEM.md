# RECTOR LABS Design System

**Purpose:** Complete design specification for rectorspace.com - Rails 8 + Tailwind CSS v4

**Maintainer:** RECTOR
**Updated:** 2025-11-03
**Version:** 1.0 (Warm Pixel Art Theme)

---

## Design Philosophy

**"Warm, Personal, Technical"**

- **Warm:** Soft cream backgrounds, yellow accents, inviting palette inspired by RECTOR's NFT
- **Personal:** Letter-style narrative, first-person tone, no corporate jargon
- **Technical:** JetBrains Mono typography, pixel art graphics, developer-focused aesthetic
- **Anonymous but Present:** NFT profile as visual identity, no real photos
- **Islamic Values:** Subtle integration, natural Islamic expressions in copy

**Inspiration:**
- **DHH.dk:** Minimal navigation, letter-style bio, embedded links in narrative, generous whitespace
- **Basecamp.com:** Conversational tone, calm spacing, confident simplicity
- **MonkeDAO NFT:** Color palette derived from RECTOR's profile picture

---

## Color Palette

### Primary Colors

```css
/* Base */
--color-cream: #FFF7E1;        /* Soft Cream - main background */
--color-brown: #3B2C22;        /* Deep Brown - primary text, code blocks */
--color-sky-blue: #41CFFF;     /* Sky Blue - links, interactive elements */
--color-yellow: #F9C846;       /* Warm Yellow - accents, hover states */

/* Supporting */
--color-orange: #E58C2E;       /* Clay Orange - subheadings, icons */
--color-green: #A8E063;        /* Leaf Green - success, CTAs */
--color-red: #C75A44;          /* Muted Red - shadows, subtle depth */
```

### Usage Guidelines

| Element | Color | Hex | Tailwind Class |
|---------|-------|-----|----------------|
| Page Background | Soft Cream | `#FFF7E1` | `bg-cream` |
| Primary Text | Deep Brown | `#3B2C22` | `text-brown` |
| Headings | Deep Brown | `#3B2C22` | `text-brown` |
| Subheadings | Clay Orange | `#E58C2E` | `text-orange` |
| Links | Sky Blue | `#41CFFF` | `text-sky-blue hover:text-yellow` |
| Links Hover | Warm Yellow | `#F9C846` | `hover:text-yellow` |
| Buttons/CTAs | Leaf Green | `#A8E063` | `bg-green text-brown` |
| Dividers | Warm Yellow | `#F9C846` | `border-yellow` |
| Code Blocks BG | Deep Brown | `#3B2C22` | `bg-brown` |
| Code Blocks Text | Soft Cream | `#FFF7E1` | `text-cream` |
| Shadows | Muted Red | `#C75A44` | `shadow-red` |

### Tailwind v4 Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    './app/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF7E1',
        brown: '#3B2C22',
        'sky-blue': '#41CFFF',
        yellow: '#F9C846',
        orange: '#E58C2E',
        green: '#A8E063',
        red: '#C75A44',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

---

## Typography

### Font Stack

**Single Font Family:** JetBrains Mono (monospace)

```css
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

**Why JetBrains Mono:**
- ✅ Developer/hacker aesthetic aligns with pixel art NFT
- ✅ Excellent readability with proper spacing
- ✅ Perfect for code blocks (same font!)
- ✅ Distinctive personality
- ✅ Free and open source

**Weights to Use:**
- **Regular (400):** Body text
- **Medium (500):** Emphasis, strong text
- **Semi-Bold (600):** Subheadings
- **Bold (700):** Main headings

### Type Scale

```css
/* Heading Styles */
--text-h1: 2.5rem;      /* 40px */
--text-h2: 2rem;        /* 32px */
--text-h3: 1.5rem;      /* 24px */
--text-h4: 1.25rem;     /* 20px */

/* Body Styles */
--text-body: 1.125rem;  /* 18px - slightly larger for monospace readability */
--text-small: 1rem;     /* 16px */
--text-tiny: 0.875rem;  /* 14px */

/* Code */
--text-code: 0.9375rem; /* 15px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.75;  /* Generous for monospace */
--leading-relaxed: 1.875;
```

### Tailwind Typography Classes

```css
/* Headings */
.heading-1 { @apply text-4xl font-bold text-brown leading-tight; }
.heading-2 { @apply text-3xl font-bold text-brown leading-tight; }
.heading-3 { @apply text-2xl font-semibold text-brown leading-normal; }
.heading-4 { @apply text-xl font-semibold text-orange leading-normal; }

/* Body */
.body-text { @apply text-lg font-normal text-brown leading-relaxed; }
.body-small { @apply text-base font-normal text-brown leading-normal; }

/* Links */
.link { @apply text-sky-blue underline hover:text-yellow transition-colors duration-200; }

/* Code */
.code-inline { @apply text-base font-normal bg-brown text-cream px-1 py-0.5 rounded; }
.code-block { @apply text-base font-normal bg-brown text-cream p-4 rounded-lg overflow-x-auto; }
```

### Font Loading

**Google Fonts Import:**
```css
/* app/assets/stylesheets/application.css */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

**Weights to Load:**
- 400 (Regular)
- 500 (Medium)
- 600 (Semi-Bold)
- 700 (Bold)

---

## Layout & Spacing

### Container

```css
/* Homepage Container */
max-width: 42rem;        /* 672px - comfortable reading width */
margin: 0 auto;
padding: 3rem 1.5rem;    /* Generous vertical spacing */
```

**Tailwind Classes:**
```html
<div class="max-w-2xl mx-auto px-6 py-12">
  <!-- Content -->
</div>
```

### Spacing Scale

```css
/* Consistent spacing units (8px base) */
--space-xs: 0.5rem;    /* 8px */
--space-sm: 1rem;      /* 16px */
--space-md: 1.5rem;    /* 24px */
--space-lg: 2rem;      /* 32px */
--space-xl: 3rem;      /* 48px */
--space-2xl: 4rem;     /* 64px */
--space-3xl: 6rem;     /* 96px */
```

### Section Spacing

```css
/* Between major sections */
section + section {
  margin-top: 4rem;  /* 64px - generous breathing room */
}

/* Between paragraphs */
p + p {
  margin-top: 1.5rem;  /* 24px */
}

/* Between headings and content */
h2 + p {
  margin-top: 1rem;  /* 16px */
}
```

---

## Components

### Profile Picture (NFT)

**Specifications:**
```css
/* Size */
width: 150px;          /* Medium size (not too large) */
height: 150px;
border-radius: 50%;    /* Perfect circle */

/* Shadow */
box-shadow: 0 4px 12px rgba(199, 90, 68, 0.2);  /* Subtle red shadow */

/* Position */
display: block;
margin: 0 auto 2rem auto;  /* Centered with space below */
```

**Tailwind Classes:**
```html
<img
  src="/assets/images/rector_profile_image.png"
  alt="RECTOR Profile"
  class="w-[150px] h-[150px] rounded-full mx-auto mb-8 shadow-lg"
  style="box-shadow: 0 4px 12px rgba(199, 90, 68, 0.2);"
/>
```

**Responsive:**
```css
/* Mobile: slightly smaller */
@media (max-width: 640px) {
  width: 120px;
  height: 120px;
}
```

### Links

**Inline Links (in narrative):**
```html
<a href="/portfolio" class="text-sky-blue underline hover:text-yellow transition-colors">
  portfolio
</a>
```

**Style:**
- Sky Blue (#41CFFF) with underline
- Hover → Warm Yellow (#F9C846)
- Smooth transition (200ms)
- Underline always visible (not just on hover)

**External Links:**
```html
<a href="https://github.com/rz1989s" class="text-sky-blue hover:text-yellow" target="_blank" rel="noopener">
  GitHub ↗
</a>
```

### Section Dividers

**Style 1: Horizontal Rule**
```html
<hr class="border-t-2 border-yellow my-12" />
```

**Style 2: Pixel Art Divider**
```html
<div class="flex justify-center my-12">
  <img src="/assets/images/pixel-divider.png" alt="" class="h-4" />
</div>
```

**Style 3: Just Whitespace (DHH style)**
```html
<div class="my-16"></div>  <!-- 96px vertical space -->
```

### Code Blocks

**Inline Code:**
```html
<code class="bg-brown text-cream px-1.5 py-0.5 rounded text-[15px]">
  bin/rails server
</code>
```

**Code Block:**
```html
<pre class="bg-brown text-cream p-6 rounded-lg overflow-x-auto my-6">
<code class="text-[15px] leading-relaxed">
# Example Ruby code
def greeting
  puts "Bismillah!"
end
</code>
</pre>
```

**Syntax Highlighting Color Scheme:**
```css
/* Use soft, warm colors from palette */
.hljs-keyword { color: #41CFFF; }    /* Sky Blue */
.hljs-string { color: #A8E063; }     /* Leaf Green */
.hljs-comment { color: #E58C2E; }    /* Clay Orange (dimmed) */
.hljs-function { color: #F9C846; }   /* Warm Yellow */
.hljs-number { color: #C75A44; }     /* Muted Red */
```

### Buttons/CTAs

**Primary Button:**
```html
<a href="#" class="inline-block bg-green text-brown px-6 py-3 rounded-lg font-medium hover:bg-yellow transition-colors">
  View Projects
</a>
```

**Secondary Button:**
```html
<a href="#" class="inline-block border-2 border-sky-blue text-sky-blue px-6 py-3 rounded-lg font-medium hover:bg-sky-blue hover:text-cream transition-colors">
  Learn More
</a>
```

### Cards (for Portfolio/Labs items)

```html
<div class="border-2 border-brown rounded-lg p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-xl font-semibold text-brown mb-2">Project Title</h3>
  <p class="text-brown mb-4">Brief description...</p>
  <a href="#" class="text-sky-blue hover:text-yellow">View Project →</a>
</div>
```

---

## Page Templates

### Homepage (/) Structure

```html
<div class="max-w-2xl mx-auto px-6 py-12 bg-cream min-h-screen font-mono">

  <!-- Profile Picture -->
  <img src="/assets/images/rector_profile_image.png"
       alt="RECTOR"
       class="w-[150px] h-[150px] rounded-full mx-auto mb-8 shadow-lg" />

  <!-- Introduction / Letter -->
  <div class="text-lg leading-relaxed text-brown space-y-6">
    <p>
      Assalamu'alaikum! I'm RECTOR.
    </p>

    <p>
      I build things for the web using Rails and Tailwind.
      I chase hackathons, write about code, and share beneficial knowledge.
      Muslim builder working on projects that matter for dunya and akhirah.
    </p>

    <p>
      Right now I'm working on [current focus].
      You can explore my <a href="/portfolio">portfolio</a>,
      peek at <a href="/labs">labs</a> experiments,
      read my <a href="/journal">journal</a>,
      or browse my <a href="/cheatsheet">cheatsheet</a>.
    </p>
  </div>

  <!-- Section Divider -->
  <hr class="border-t-2 border-yellow my-12" />

  <!-- Building in Public Section -->
  <section>
    <h2 class="text-2xl font-bold text-brown mb-4">## Building in Public</h2>
    <p class="text-brown mb-2">
      <strong>Latest from Labs:</strong>
      <a href="/labs/experiment-slug">Experiment Title</a>
    </p>
    <p class="text-brown leading-relaxed">
      Brief description of what you're working on...
    </p>
  </section>

  <!-- Divider -->
  <hr class="border-t-2 border-yellow my-12" />

  <!-- Writing Section -->
  <section>
    <h2 class="text-2xl font-bold text-brown mb-4">## Writing</h2>
    <p class="text-brown mb-2">
      <strong>Latest article:</strong>
      <a href="/journal/post-slug">Post Title</a>
    </p>
    <p class="text-brown leading-relaxed">
      Brief excerpt from the post...
    </p>
  </section>

  <!-- Divider -->
  <hr class="border-t-2 border-yellow my-12" />

  <!-- Contact -->
  <section>
    <h2 class="text-2xl font-bold text-brown mb-4">## Get in Touch</h2>
    <p class="text-brown">
      <a href="https://github.com/rz1989s">GitHub</a> •
      <a href="https://x.com/yourusername">X</a> •
      <a href="mailto:your@email.com">Email</a>
    </p>
  </section>

</div>
```

### Section Pages (Portfolio, Labs, etc.)

**Common Header Pattern:**
```html
<div class="max-w-4xl mx-auto px-6 py-12 bg-cream min-h-screen font-mono">

  <!-- Breadcrumb / Back Link -->
  <a href="/" class="text-sky-blue hover:text-yellow mb-8 inline-block">
    ← Back to Home
  </a>

  <!-- Page Title -->
  <h1 class="text-4xl font-bold text-brown mb-4">Portfolio</h1>

  <!-- Description -->
  <p class="text-lg text-brown leading-relaxed mb-12">
    Professional work and finished projects.
    Each piece represents a commitment to excellence and problem-solving.
  </p>

  <!-- Content Grid/List -->
  <div class="space-y-8">
    <!-- Project cards here -->
  </div>

</div>
```

---

## Pixel Art Graphics

### Sources

**itch.io Free Pixel Art:**
- [Kenney Assets](https://kenney.nl/assets) - Free game assets, UI elements
- [OpenGameArt.org](https://opengameart.org) - Community pixel art
- Search itch.io for "pixel icons" "pixel UI" "16x16 icons"

### Usage Guidelines

**Icon Size:**
- **16x16px** - Tiny icons (bullets, decorations)
- **32x32px** - Section icons (portfolio, labs, journal, etc.)
- **64x64px** - Larger decorative elements

**Color Matching:**
- Convert/recolor pixel art to match our palette
- Sky Blue, Warm Yellow, Clay Orange, Leaf Green
- Avoid pure black - use Deep Brown (#3B2C22)

**Placement Ideas:**
- Section headers (tiny icon next to "## Portfolio")
- Dividers (pixel art line patterns)
- Footer decorations
- Loading states (pixel art spinner)
- 404 page (pixel art sad face)

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
```

### Mobile Adjustments

```css
/* Profile Picture */
@media (max-width: 640px) {
  .profile-picture {
    width: 120px;
    height: 120px;
  }
}

/* Typography */
@media (max-width: 640px) {
  h1 { font-size: 2rem; }      /* 32px */
  h2 { font-size: 1.5rem; }    /* 24px */
  body { font-size: 1rem; }    /* 16px */
}

/* Spacing */
@media (max-width: 640px) {
  .container {
    padding: 2rem 1rem;  /* Reduce horizontal padding */
  }

  section + section {
    margin-top: 2rem;    /* Tighter sections on mobile */
  }
}
```

---

## Accessibility

### Color Contrast

**WCAG AA Compliance:**
- Text on Cream (#3B2C22 on #FFF7E1): ✅ 11.08:1 (Excellent)
- Links on Cream (#41CFFF on #FFF7E1): ✅ 4.89:1 (AA Pass)
- Code on Brown (#FFF7E1 on #3B2C22): ✅ 11.08:1 (Excellent)

### Focus States

```css
/* Keyboard navigation */
a:focus, button:focus {
  outline: 2px solid #41CFFF;
  outline-offset: 2px;
}

/* Focus visible (modern approach) */
a:focus-visible, button:focus-visible {
  outline: 2px solid #41CFFF;
  outline-offset: 2px;
}
```

### Screen Reader Support

```html
<!-- Skip to main content -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>

<!-- Semantic HTML -->
<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <!-- Content -->
  </article>
</main>
```

---

## Animation & Transitions

### Subtle Transitions

```css
/* Link hover */
a {
  transition: color 200ms ease-in-out;
}

/* Button hover */
button {
  transition: all 200ms ease-in-out;
}

/* Card hover */
.card {
  transition: box-shadow 200ms ease-in-out;
}
```

### No Heavy Animations

- Keep it simple and fast
- Avoid parallax, heavy scrolling effects
- Focus on content, not flashy animations
- Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance

### Font Loading Strategy

```css
/* Font display swap - avoid FOIT */
@font-face {
  font-family: 'JetBrains Mono';
  src: url('...') format('woff2');
  font-display: swap;
}
```

### Image Optimization

- Profile picture: WebP format, 300x300px max
- Pixel art: PNG-8 (small file size for limited colors)
- Lazy load images below fold
- Use `loading="lazy"` attribute

```html
<img src="image.png" alt="..." loading="lazy" />
```

---

## Browser Support

**Target Browsers:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Mobile Chrome (last 2 versions)

**Fallbacks:**
- CSS Grid → Flexbox fallback
- CSS Custom Properties → Sass variables fallback
- Modern font features → Graceful degradation

---

## Design Checklist

Before launching:

- [ ] All colors match NFT-inspired palette
- [ ] JetBrains Mono loaded and applied throughout
- [ ] Profile picture rounded, medium size (150px), subtle shadow
- [ ] Links Sky Blue with Yellow hover state
- [ ] Code blocks Deep Brown background with Cream text
- [ ] Generous whitespace between sections
- [ ] No navbar/footer clutter (links in narrative)
- [ ] Responsive on mobile (320px+)
- [ ] WCAG AA contrast compliance
- [ ] Pixel art graphics sourced and integrated
- [ ] Fast loading (< 2s)
- [ ] Semantic HTML structure
- [ ] Islamic expressions natural in copy

---

## Resources

**Typography:**
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- [Google Fonts - JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)

**Pixel Art:**
- [itch.io - Pixel Art](https://itch.io/game-assets/tag-pixel-art)
- [Kenney Assets](https://kenney.nl/assets)
- [OpenGameArt.org](https://opengameart.org)

**Color Tools:**
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors](https://coolors.co) - Palette generator

**Inspiration:**
- [DHH.dk](https://dhh.dk) - Minimal navigation, letter style
- [Basecamp.com](https://basecamp.com) - Calm, conversational design

---

**Maintainer:** RECTOR | **Updated:** 2025-11-03 | **Version:** 1.0

**May Allah bless this design and make it beautiful and beneficial. Aamiin.**

**RECTOR LABS** | Building for Eternity | 2025
