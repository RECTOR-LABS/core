# Homepage Design Specification - Terminal × Pixel Art

**Project:** rectorspace.com
**Version:** 1.0
**Created:** 2025-11-02
**Status:** Design Phase

---

## 🎯 Vision

A **terminal-style interactive homepage** with pixel art aesthetic that showcases RECTOR's identity through an immersive command-line experience. Not a typical portfolio - a playground that screams "This developer is on another level!"

---

## 🎨 Design Concept

### Core Aesthetic
- **Terminal Interface:** Full terminal emulator experience
- **Pixel Art:** MonkeDAO NFT Gen3 style, 8-bit graphics
- **JetBrains Mono:** Monospace font throughout
- **Interactive:** Every element responds to user input
- **Show-Off Mode:** Technical flex meets artistic expression

### Color Palette (Terminal Theme)
```json
{
  "background": "#000000",
  "terminal_bg": "#0A0E14",
  "primary_text": "#00FF41",
  "secondary_text": "#00D9FF",
  "accent_turquoise": "#5EDDC6",
  "accent_blue": "#42A5F5",
  "error": "#FF5555",
  "success": "#50FA7B",
  "cursor": "#00D9FF",
  "border": "#00FF41"
}
```

### Typography
- **Font Family:** 'JetBrains Mono', monospace
- **All text:** Monospace, code-style
- **Headers:** ASCII art
- **Body:** 16px base, 1.5 line-height

---

## 🖥️ Interface Layout

### Desktop Layout (>1024px)
```
┌──────────────────────┬──────────────────────────────────┐
│  NAVIGATOR (20%)     │  TERMINAL OUTPUT (80%)           │
│  ════════════        │  ══════════════                  │
│                      │                                  │
│  [●] home            │  rector@rectorspace:~$           │
│  [ ] about           │                                  │
│  [ ] platforms       │  [Content based on navigation]   │
│  [ ] projects        │                                  │
│  [ ] contact         │                                  │
│                      │                                  │
│  ─────────────       │                                  │
│  QUICK COMMANDS      │                                  │
│  > help              │                                  │
│  > ls                │                                  │
│  > whoami            │                                  │
│  > ssh platforms     │                                  │
│                      │                                  │
│  ─────────────       │                                  │
│  STATUS              │                                  │
│  6/6 online ✓        │                                  │
└──────────────────────┴──────────────────────────────────┘
```

### Mobile Layout (<768px)
```
┌──────────────────────────────────┐
│  [☰] rector@rectorspace:~$ ▊     │
│  ──────────────────────────────  │
│                                  │
│  [Terminal Output]               │
│                                  │
│  Quick: [home] [about] [plat]    │
└──────────────────────────────────┘
```

---

## 🎮 Interactive Features

### 1. Boot Sequence (Auto-plays on load)
```
RECTOR OS v1.0.0 booting...
[████████████████████████████] 100%

✓ Loading design-system.so
✓ Initializing platforms...
✓ Mounting subdomains... (6/6 online)
✓ Starting portfolio-sync daemon
✓ Loading pixel-art renderer

System ready. Welcome, visitor.
rector@rectorspace:~$ ▊
```
- **Duration:** 2-3 seconds
- **Skippable:** Click anywhere
- **Sound:** Optional typing sounds

### 2. Terminal Commands

#### Navigation Commands
```bash
help              # Show all available commands
ls                # List current directory contents
cd <section>      # Navigate to section (about, platforms, etc)
clear             # Clear terminal screen
pwd               # Print working directory
```

#### Platform Commands
```bash
ssh portfolio     # Open portfolio.rectorspace.com
ssh labs          # Open labs.rectorspace.com
ssh cheatsheet    # Open cheatsheet.rectorspace.com
ssh journal       # Open journal.rectorspace.com
ssh dakwa         # Open dakwa.rectorspace.com
ssh quran         # Open quran.rectorspace.com
```

#### Info Commands
```bash
whoami            # About RECTOR
cat skills.json   # Display skills as JSON
cat about.md      # Display about information
neofetch          # System info (fun)
fortune           # Random Islamic quote
```

#### Easter Eggs
```bash
matrix            # Matrix rain effect
konami            # Secret (↑↑↓↓←→←→BA)
sl                # Train animation
cowsay            # Pixel cow wisdom
play              # Simple pixel game
```

### 3. Command Parser Logic
- Parse input on Enter
- Tab completion support
- Up/down arrow history navigation
- Command not found errors
- Syntax highlighting
- Auto-suggestions

---

## 🎨 Pixel Art Elements

### 1. MonkeDAO NFT Avatar
- **Size:** 200x200px pixel grid
- **Style:** 8-bit, pixelated
- **Animations:**
  - Idle: Subtle breathing
  - Hover: Glitch effect
  - Click: Flip/rotate
- **Location:** Hero section

### 2. Platform Icons (8-bit style)
```
💼 Portfolio   → Pixel briefcase
🔬 Labs        → Pixel beaker
📋 Cheatsheet  → Pixel clipboard
📖 Journal     → Pixel book
🕌 Da'wah      → Pixel mosque
📿 Quran       → Pixel tasbih
```

### 3. Pixel Art Renderer
- CSS Grid-based pixel rendering
- Scalable without blur
- Color palette constraints

---

## ✨ Micro-Animations

### 1. Typewriter Effect
```typescript
// All text appears with typing animation
typewriterSpeed: 50ms per character
cursor: blinking block (1s interval)
sound: Optional mechanical keyboard sound
```

### 2. Matrix Rain
```css
background: Falling green/cyan characters
opacity: 0.1 (subtle)
speed: Slow cascade
toggle: matrix command or always-on
```

### 3. Glitch Effects
```css
/* On hover */
.card:hover {
  animation: glitch 0.3s;
  /* RGB split effect */
}
```

### 4. Scanlines
```css
/* Terminal CRT effect */
background: repeating-linear-gradient(
  0deg,
  rgba(0,0,0,0.1) 0px,
  rgba(0,0,0,0.1) 1px,
  transparent 1px,
  transparent 2px
);
```

### 5. Cursor Trail
- Gradient particle trail follows mouse
- Pixel particles on click
- Performance-optimized canvas

---

## 📦 Component Architecture

### Core Components
```
<TerminalInterface />
  ├── <BootSequence />
  ├── <CommandPrompt />
  │     ├── <InputField />
  │     └── <AutoComplete />
  ├── <Navigator />
  ├── <OutputDisplay />
  └── <StatusBar />

<PixelArtAvatar nft={monkeDaoData} />

<MatrixRain density="low" color="cyan" />

<TypewriterText speed={50} cursor={true} />

<PlatformCard
  title="Portfolio"
  icon={<PixelIcon type="briefcase" />}
  command="ssh portfolio"
  url="https://portfolio.rectorspace.com"
/>

<GlitchEffect trigger="hover" />

<ParticleSystem type="cursor-trail" />
```

---

## 🎯 Content Sections

### Home Screen (Default)
```
┌─────────────────────────────────────────┐
│  ██████╗ ███████╗ ██████╗████████╗      │
│  ██╔══██╗██╔════╝██╔════╝╚══██╔══╝      │
│  ██████╔╝█████╗  ██║        ██║         │
│  ██╔══██╗██╔══╝  ██║        ██║         │
│  ██║  ██║███████╗╚██████╗   ██║         │
│  ╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝         │
│                                         │
│  [MonkeDAO Pixel Avatar]                │
│                                         │
│  > Building for Eternity                │
│  > Dunya & Akhirah                      │
│  > Senior Developer | Independent       │
│                                         │
│  Type 'help' to explore                 │
└─────────────────────────────────────────┘
```

### About Screen (cd about)
```
rector@rectorspace:~/about$ cat about.md

┌─────────────────────────────────────────┐
│  ABOUT RECTOR                           │
│  ════════════                           │
│                                         │
│  Senior Developer & Independent Builder │
│  Based in [Location]                    │
│                                         │
│  PHILOSOPHY:                            │
│  • Ihsan (Excellence in all work)       │
│  • Amanah (Trustworthy stewardship)     │
│  • Avoid Israf (No waste, efficiency)   │
│                                         │
│  BUILDING FOR:                          │
│  • Dunya: Technical excellence          │
│  • Akhirah: Islamic platforms           │
│                                         │
│  "Code is art, art is worship"          │
└─────────────────────────────────────────┘
```

### Platforms Screen (cd platforms)
```
rector@rectorspace:~/platforms$ ls -la

┌──────────────────────────────────────────┐
│  drwxr-xr-x  6 rector  192  Nov 2 2025   │
│                                          │
│  [💼] PORTFOLIO                          │
│  GitHub-powered project showcase         │
│  → ssh portfolio                         │
│                                          │
│  [🔬] RECTOR LABS                        │
│  Organization & experiments              │
│  → ssh labs                              │
│                                          │
│  [📋] CHEATSHEET                         │
│  Developer reference library             │
│  → ssh cheatsheet                        │
│                                          │
│  [📖] JOURNAL                            │
│  Personal blog & reflections             │
│  → ssh journal                           │
│                                          │
│  [🕌] DA'WAH                             │
│  Islamic content & resources             │
│  → ssh dakwa                             │
│                                          │
│  [📿] QURAN                              │
│  Quranic tools & translations            │
│  → ssh quran                             │
└──────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Core Framework
- **Astro 4.0+** - Static site generation with islands
- **React 18+** - Interactive components
- **Tailwind CSS 3.0+** - Utility-first styling

### Animation Libraries
- **Framer Motion** - Smooth animations
- **Typed.js** - Typewriter effects
- **Particles.js** - Particle systems
- **Canvas API** - Custom pixel art

### Terminal Implementation
- Custom command parser
- Command history management
- Tab completion
- Syntax highlighting

### Performance
- **Island Architecture** - Only hydrate interactive components
- **Lazy Loading** - Load animations on demand
- **Code Splitting** - Minimal initial bundle
- **Target:** Lighthouse 95+

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
mobile: 320px - 767px
tablet: 768px - 1023px
desktop: 1024px - 1439px
wide: 1440px+

/* Critical adjustments */
@media (max-width: 767px) {
  /* Single terminal view */
  /* Hide navigator */
  /* Touch-optimized commands */
}
```

---

## 🎯 Performance Targets

- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s
- **Lighthouse Performance:** 95+
- **Lighthouse Accessibility:** 100
- **Bundle Size:** < 100kb (initial)
- **Animation FPS:** 60fps constant

---

## 🔐 SEO & Meta

```html
<title>RECTOR - Terminal × Pixel Art Portfolio</title>
<meta name="description" content="Interactive terminal-style homepage showcasing RECTOR's work. Building for Dunya & Akhirah." />

<meta property="og:title" content="RECTOR - Developer Terminal" />
<meta property="og:description" content="Explore RECTOR's platforms through an interactive terminal experience" />
<meta property="og:image" content="/og-terminal-preview.png" />
<meta property="og:type" content="website" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="RECTOR - Terminal Portfolio" />

<link rel="canonical" href="https://rectorspace.com" />
```

---

## 🎨 Accessibility

- **Keyboard Navigation:** Full keyboard support
- **Screen Readers:** Semantic HTML, ARIA labels
- **Focus States:** Visible focus indicators
- **Color Contrast:** WCAG AA compliant
- **Reduced Motion:** Respect prefers-reduced-motion
- **Alt Text:** All images/icons described

---

## 🚀 Future Enhancements (Post-MVP)

### Phase 2 (Week 3)
- Sound effects toggle
- WebGL pixel shaders
- Real-time visitor counter
- Terminal collaboration (see other users)

### Phase 3 (Week 4+)
- Pixel art builder tool
- Mini games (Snake, Pong)
- AI terminal assistant
- Blockchain integration (show NFT)

---

## 📊 Success Metrics

**Quantitative:**
- Lighthouse Performance: 95+
- Average session duration: >2 minutes
- Bounce rate: <40%
- Mobile usability: 100/100

**Qualitative:**
- "WTF this is insane!" reactions
- Social media shares
- Developer community buzz
- "How did you build this?" questions

---

## 🎬 Development Phases

### Week 2 - MVP
1. Terminal interface
2. Command system
3. Basic animations
4. Platform cards
5. MonkeDAO avatar
6. Responsive design

### Week 3 - Polish
1. Matrix effects
2. Easter eggs
3. Sound system
4. Performance optimization
5. SEO implementation

### Week 4 - Launch
1. Final testing
2. Content writing
3. Deploy to VPS
4. Announce launch

---

**Document Status:** Living specification - updated as development progresses

**Maintained by:** RECTOR
**Last Updated:** 2025-11-02

Bismillah! Let's build the most epic developer homepage the internet has ever seen! 🚀💻🎮
