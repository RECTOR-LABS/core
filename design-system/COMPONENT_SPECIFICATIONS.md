# Component Specifications

**Version:** 1.0
**Last Updated:** 2025-11-02
**Status:** Specification Phase - Implementation in Week 2

---

## Overview

This document specifies the design system components for the RECTOR LABS ecosystem. Components will be implemented in Week 2 during Homepage development, then extracted to a shared library as needed.

**Tech Stack:**
- React + TypeScript
- Tailwind CSS
- Shared across all Next.js/Astro platforms

**Design Tokens:**
- Colors: `/design-system/colors.json`
- Typography: `/design-system/typography.json`
- Brand Guidelines: `/docs/BRAND_GUIDELINES.md`

---

## Component Library Structure

```
design-system/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx (Storybook)
│   └── README.md
├── Card/
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   └── README.md
├── Header/
│   ├── Header.tsx
│   ├── Header.stories.tsx
│   └── README.md
├── Footer/
│   ├── Footer.tsx
│   ├── Footer.stories.tsx
│   └── README.md
└── index.ts (exports)
```

**Note:** Actual implementation deferred to Week 2 (Homepage development).

---

## 1. Button Component

### Purpose
Primary interactive element across all platforms. Supports multiple variants and states.

### Props Interface

```typescript
interface ButtonProps {
  // Content
  children: React.ReactNode;

  // Variants
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';

  // State
  disabled?: boolean;
  loading?: boolean;

  // Icon support
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';

  // Behavior
  onClick?: () => void;
  href?: string; // Renders as <a> if provided
  type?: 'button' | 'submit' | 'reset';

  // Styling
  className?: string;
  fullWidth?: boolean;
}
```

### Variants

**Primary** (Default)
- Background: Gradient (Turquoise → Cyan → Blue)
- Text: White
- Hover: Brightness +10%
- Use: Primary actions (Submit, Create, Confirm)

**Secondary**
- Background: Navy (#2C3E50)
- Text: White
- Hover: Turquoise glow
- Use: Secondary actions (Cancel, Back)

**Outline**
- Border: Gradient
- Background: Transparent
- Text: Gradient
- Hover: Filled gradient
- Use: Tertiary actions, navigation

**Ghost**
- Background: Transparent
- Text: Cyan
- Hover: Navy background
- Use: Inline actions, minimal UI

**Danger**
- Background: Red (#EF4444)
- Text: White
- Hover: Darken
- Use: Destructive actions (Delete, Remove)

### Sizes

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| sm   | px-3 py-1.5 | 0.875rem (14px) | 32px |
| md   | px-4 py-2 | 1rem (16px) | 40px |
| lg   | px-6 py-3 | 1.125rem (18px) | 48px |

### States

**Disabled**
- Opacity: 0.5
- Cursor: not-allowed
- No hover effects

**Loading**
- Show spinner icon
- Disable interactions
- Keep normal styling

### Accessibility
- ARIA labels when icon-only
- Focus visible outline (cyan ring)
- Keyboard navigation support

### Example Usage

```tsx
// Primary action
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit
</Button>

// With icon
<Button variant="outline" icon={<ArrowRight />} iconPosition="right">
  Continue
</Button>

// Loading state
<Button loading={true}>
  Creating...
</Button>

// Link button
<Button variant="ghost" href="/about">
  Learn More
</Button>
```

---

## 2. Card Component

### Purpose
Container for grouping related content. Used across portfolio, labs, cheatsheet platforms.

### Props Interface

```typescript
interface CardProps {
  // Content
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;

  // Variants
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';

  // Interaction
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  href?: string; // Renders as link if provided

  // Layout
  padding?: 'none' | 'sm' | 'md' | 'lg';

  // Styling
  className?: string;
}
```

### Variants

**Default**
- Background: Dark Navy (#1A252F)
- Border: 1px solid rgba(94, 221, 198, 0.2)
- Shadow: None
- Use: General content containers

**Elevated**
- Background: Navy (#2C3E50)
- Shadow: Large cyan glow
- Border: Gradient (subtle)
- Use: Featured content, important sections

**Bordered**
- Background: Transparent
- Border: 2px gradient
- Shadow: None
- Use: Outlined sections, navigation cards

**Glass** (Glassmorphism)
- Background: rgba(26, 37, 47, 0.7)
- Backdrop blur: 10px
- Border: 1px gradient
- Shadow: Soft glow
- Use: Overlays, modern UI sections

### States

**Hoverable**
- Transform: translateY(-4px)
- Shadow: Increased glow
- Transition: 0.3s ease

**Clickable**
- Cursor: pointer
- Hover effects active
- Focus: Cyan ring

### Padding Options

| Padding | Value |
|---------|-------|
| none    | 0 |
| sm      | 1rem (16px) |
| md      | 1.5rem (24px) |
| lg      | 2rem (32px) |

### Example Usage

```tsx
// Project card
<Card
  variant="elevated"
  hoverable={true}
  clickable={true}
  href="/project/example"
  image="/project-thumbnail.jpg"
  title="Project Name"
  description="Brief description..."
>
  <ProjectDetails />
</Card>

// Simple container
<Card variant="default" padding="lg">
  <p>Content goes here</p>
</Card>

// Glass effect
<Card variant="glass" padding="md">
  <HeroContent />
</Card>
```

---

## 3. Header Component

### Purpose
Global navigation header across all platforms. Consistent branding and navigation.

### Props Interface

```typescript
interface HeaderProps {
  // Branding
  logo?: React.ReactNode;
  title?: string;

  // Navigation
  links?: NavLink[];

  // Variants
  variant?: 'default' | 'transparent' | 'solid';

  // Behavior
  sticky?: boolean;
  showSearch?: boolean;

  // Custom actions
  actions?: React.ReactNode; // Custom right-side content

  // Styling
  className?: string;
}

interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}
```

### Variants

**Default**
- Background: Dark Navy with slight transparency
- Backdrop blur: 10px
- Border bottom: 1px gradient
- Height: 64px

**Transparent**
- Background: Fully transparent
- No border
- Hover: Show background
- Use: Hero sections, landing pages

**Solid**
- Background: Solid Navy (#2C3E50)
- Border bottom: Gradient
- No transparency
- Use: App dashboards, internal pages

### Features

**Sticky Behavior**
- Fixed position on scroll
- Smooth transition
- Z-index: 50

**Mobile Responsive**
- Hamburger menu <768px
- Slide-out navigation drawer
- Full-height mobile menu

**Logo Area**
- RECTOR LABS logo (left)
- Optional subdomain title

**Navigation Links**
- Horizontal list (desktop)
- Gradient underline on hover
- Active state: Full gradient underline

**Actions Area**
- Search icon (optional)
- Theme toggle (future)
- Custom buttons/icons

### Accessibility
- Skip to content link
- Keyboard navigation
- ARIA labels
- Focus management

### Example Usage

```tsx
// Homepage header
<Header
  logo={<Logo />}
  title="RECTOR SPACE"
  variant="transparent"
  sticky={true}
  links={[
    { label: 'About', href: '#about' },
    { label: 'Portfolio', href: 'https://portfolio.rectorspace.com' },
    { label: 'Labs', href: 'https://labs.rectorspace.com' },
    { label: 'Contact', href: '#contact' }
  ]}
  showSearch={false}
/>

// Internal app header
<Header
  variant="solid"
  sticky={true}
  links={navLinks}
  actions={<UserMenu />}
/>
```

---

## 4. Footer Component

### Purpose
Global footer with links, branding, and legal information.

### Props Interface

```typescript
interface FooterProps {
  // Links
  sections?: FooterSection[];

  // Branding
  showLogo?: boolean;
  tagline?: string;

  // Social
  socialLinks?: SocialLink[];

  // Legal
  copyright?: string;
  legalLinks?: NavLink[];

  // Styling
  variant?: 'default' | 'minimal';
  className?: string;
}

interface FooterSection {
  title: string;
  links: NavLink[];
}

interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'email';
  url: string;
  icon?: React.ReactNode;
}
```

### Variants

**Default**
- Background: Dark Navy (#1A252F)
- Border top: Gradient
- Padding: Large (60px vertical)
- Multi-column layout

**Minimal**
- Background: Navy (#2C3E50)
- Single row
- Copyright + social only
- Padding: Small (24px vertical)

### Layout

**Desktop (>768px)**
```
[Logo + Tagline]  [Section 1]  [Section 2]  [Section 3]  [Social Links]
                  [Links...]   [Links...]   [Links...]   [Icons]

[Copyright] [Legal Links (Privacy, Terms)]
```

**Mobile (<768px)**
```
[Logo + Tagline]

[Section 1]
[Links (vertical)]

[Section 2]
[Links (vertical)]

[Social Links (horizontal)]

[Copyright]
[Legal Links]
```

### Features

**Logo + Tagline**
- RECTOR LABS logo
- Gradient tagline
- Islamic expression (optional)

**Link Sections**
- Grouped navigation (Platforms, Resources, Company)
- Gradient hover effect
- Icon support

**Social Links**
- Icon-only buttons
- Gradient on hover
- Open in new tab

**Legal Footer**
- Copyright year (auto-updated)
- Privacy Policy, Terms links
- Small, subtle styling

### Accessibility
- Semantic footer element
- ARIA labels for social links
- Keyboard navigation
- Focus visible states

### Example Usage

```tsx
// Full footer
<Footer
  showLogo={true}
  tagline="Building for Eternity - Dunya & Akhirah"
  sections={[
    {
      title: 'Platforms',
      links: [
        { label: 'Homepage', href: 'https://rectorspace.com' },
        { label: 'Portfolio', href: 'https://portfolio.rectorspace.com' },
        { label: 'Labs', href: 'https://labs.rectorspace.com' },
        { label: 'Cheatsheet', href: 'https://cheatsheet.rectorspace.com' }
      ]
    },
    {
      title: 'Da\'wah',
      links: [
        { label: 'Islamic Content', href: 'https://dakwa.rectorspace.com' },
        { label: 'Quran Resources', href: 'https://quran.rectorspace.com' },
        { label: 'Journal', href: 'https://journal.rectorspace.com' }
      ]
    }
  ]}
  socialLinks={[
    { platform: 'github', url: 'https://github.com/rz1989s' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/rector' },
    { platform: 'email', url: 'mailto:rector@rectorspace.com' }
  ]}
  copyright={`© ${new Date().getFullYear()} RECTOR LABS. All rights reserved.`}
  legalLinks={[
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ]}
/>

// Minimal footer
<Footer
  variant="minimal"
  showLogo={false}
  copyright="© 2025 RECTOR LABS"
  socialLinks={socialLinks}
/>
```

---

## 5. Design Tokens Reference

### Colors (from `/design-system/colors.json`)

**Primary Gradient:**
```css
background: linear-gradient(135deg, #5EDDC6 0%, #4DD0E1 50%, #42A5F5 100%);
```

**Backgrounds:**
- Dark Navy: #1A252F
- Navy: #2C3E50

**Accents:**
- Turquoise: #5EDDC6
- Cyan: #4DD0E1
- Blue: #42A5F5

### Typography (from `/design-system/typography.json`)

**Font Families:**
- Headings: 'Space Grotesk', sans-serif
- Body: 'Inter', sans-serif
- Code: 'JetBrains Mono', monospace

**Scale:**
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
- 5xl: 3rem (48px)

### Spacing

Follow Tailwind's spacing scale (4px increments):
- 1 = 0.25rem (4px)
- 2 = 0.5rem (8px)
- 3 = 0.75rem (12px)
- 4 = 1rem (16px)
- 6 = 1.5rem (24px)
- 8 = 2rem (32px)
- 12 = 3rem (48px)

### Borders

**Radius:**
- sm: 0.25rem (4px)
- DEFAULT: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)
- xl: 1rem (16px)

**Gradient Border:**
```css
border-image: linear-gradient(135deg, #5EDDC6, #4DD0E1, #42A5F5) 1;
```

### Shadows

**Glow (Cyan):**
```css
box-shadow: 0 10px 40px rgba(77, 208, 225, 0.3);
```

**Glow (Turquoise):**
```css
box-shadow: 0 10px 40px rgba(94, 221, 198, 0.3);
```

### Transitions

**Default:**
```css
transition: all 0.3s ease;
```

**Smooth:**
```css
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Implementation Timeline

### Week 2 (Homepage Development)
1. Implement Button component in Homepage repo
2. Implement Card component
3. Implement Header component
4. Implement Footer component
5. Test in Homepage context

### Week 3 (Component Extraction)
1. Extract to shared library (if needed)
2. Setup Storybook
3. Create component stories
4. Document usage examples
5. Publish to npm (optional, for future reuse)

### Week 4+ (Component Expansion)
- Input components (TextField, Checkbox, Radio)
- Navigation components (Tabs, Breadcrumbs)
- Feedback components (Alert, Toast, Modal)
- Layout components (Container, Grid, Stack)

---

## Testing Strategy

### Visual Testing
- Storybook for all variants
- Chromatic for visual regression (optional)

### Accessibility Testing
- WAVE browser extension
- Keyboard navigation manual testing
- Screen reader testing (VoiceOver/NVDA)

### Cross-Browser Testing
- Chrome (primary)
- Firefox
- Safari
- Edge

### Responsive Testing
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

---

## Future Components (Post-Week 4)

**Forms:**
- TextField
- TextArea
- Select
- Checkbox
- Radio
- Switch
- DatePicker

**Navigation:**
- Tabs
- Breadcrumbs
- Pagination
- Sidebar

**Feedback:**
- Alert
- Toast
- Modal
- Tooltip
- Progress

**Data Display:**
- Table
- Badge
- Avatar
- Accordion

**Layout:**
- Container
- Grid
- Stack
- Divider

---

## Notes

- All components use Tailwind CSS utility classes
- TypeScript strict mode enabled
- Components are server-compatible (Next.js SSR)
- Astro components will be separate implementations using same design tokens
- Islamic expressions in footer/branding (natural integration)

---

**Maintained by:** RECTOR
**Status:** Specification Complete - Ready for Week 2 Implementation
**Next Action:** Build components during Homepage development (Week 2)
