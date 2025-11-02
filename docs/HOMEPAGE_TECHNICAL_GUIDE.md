# Homepage Technical Implementation Guide

**Project:** rectorspace.com - Terminal × Pixel Art Homepage
**Created:** 2025-11-02
**Tech Lead:** RECTOR

---

## 🏗️ Project Structure

```
homepage/
├── public/
│   ├── fonts/
│   │   └── JetBrainsMono/
│   ├── pixel-art/
│   │   ├── monkedao-nft.png
│   │   └── platform-icons/
│   └── sounds/
│       ├── typing.mp3
│       └── beep.mp3
├── src/
│   ├── components/
│   │   ├── terminal/
│   │   │   ├── TerminalInterface.tsx
│   │   │   ├── CommandPrompt.tsx
│   │   │   ├── OutputDisplay.tsx
│   │   │   ├── Navigator.tsx
│   │   │   └── BootSequence.tsx
│   │   ├── animations/
│   │   │   ├── TypewriterText.tsx
│   │   │   ├── MatrixRain.tsx
│   │   │   ├── GlitchEffect.tsx
│   │   │   └── ParticleSystem.tsx
│   │   ├── pixel-art/
│   │   │   ├── PixelArtAvatar.tsx
│   │   │   ├── PixelIcon.tsx
│   │   │   └── PixelRenderer.tsx
│   │   └── platforms/
│   │       ├── PlatformCard.tsx
│   │       └── PlatformGrid.tsx
│   ├── lib/
│   │   ├── commands/
│   │   │   ├── parser.ts
│   │   │   ├── router.ts
│   │   │   └── registry.ts
│   │   ├── terminal/
│   │   │   ├── history.ts
│   │   │   ├── autocomplete.ts
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── ascii-art.ts
│   │       └── animations.ts
│   ├── content/
│   │   ├── about.md
│   │   ├── platforms.json
│   │   └── skills.json
│   ├── styles/
│   │   ├── global.css
│   │   └── terminal.css
│   └── pages/
│       └── index.astro
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## 📦 Dependencies

### package.json
```json
{
  "name": "homepage",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "lint": "eslint src --ext .ts,.tsx,.astro"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@astrojs/react": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.16.0",
    "typed.js": "^2.1.0",
    "tsparticles": "^3.0.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0"
  }
}
```

---

## ⚙️ Configuration Files

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['framer-motion'],
    },
  },
  site: 'https://rectorspace.com',
  output: 'static',
});
```

### tailwind.config.mjs
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0A0E14',
          black: '#000000',
          green: '#00FF41',
          cyan: '#00D9FF',
          turquoise: '#5EDDC6',
          blue: '#42A5F5',
          red: '#FF5555',
          success: '#50FA7B',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
```

### tsconfig.json
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

---

## 🎨 Global Styles

### src/styles/global.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono/JetBrainsMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: 'JetBrains Mono', monospace;
  background: #000000;
  color: #00FF41;
  overflow-x: hidden;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #0A0E14;
}

::-webkit-scrollbar-thumb {
  background: #00FF41;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00D9FF;
}

/* Selection styling */
::selection {
  background: #00FF41;
  color: #000000;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### src/styles/terminal.css
```css
/* Terminal Interface Styles */
.terminal-container {
  min-height: 100vh;
  background: #000000;
  display: flex;
}

.terminal-navigator {
  width: 20%;
  min-width: 200px;
  background: #0A0E14;
  border-right: 2px solid #00FF41;
  padding: 1rem;
}

.terminal-output {
  flex: 1;
  padding: 2rem;
  background: #000000;
}

/* Cursor */
.terminal-cursor {
  display: inline-block;
  width: 0.6em;
  height: 1.2em;
  background: #00D9FF;
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

/* Scanline effect */
.terminal-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  opacity: 0.3;
}

/* CRT flicker */
@keyframes flicker {
  0% {
    opacity: 0.97;
  }
  5% {
    opacity: 1;
  }
  10% {
    opacity: 0.98;
  }
  100% {
    opacity: 1;
  }
}

.terminal-crt {
  animation: flicker 0.15s infinite;
}

/* ASCII Art */
.ascii-art {
  font-size: 0.8rem;
  line-height: 1;
  white-space: pre;
  font-family: 'JetBrains Mono', monospace;
  color: #00FF41;
}

/* Command prompt */
.command-prompt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #00D9FF;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  caret-color: #00D9FF;
}

/* Navigation items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.nav-item:hover {
  background: rgba(0, 255, 65, 0.1);
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(0, 255, 65, 0.2);
  border-left: 3px solid #00FF41;
}

/* Platform cards */
.platform-card {
  background: #0A0E14;
  border: 2px solid #00FF41;
  padding: 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.platform-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 255, 65, 0.4);
  border-color: #00D9FF;
}

.platform-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.platform-card:hover::before {
  opacity: 1;
}

/* Glitch effect */
@keyframes glitch-anim {
  0% {
    clip-path: inset(40% 0 61% 0);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
  }
}

.glitch {
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-anim 2s infinite linear alternate-reverse;
  color: #00D9FF;
  z-index: -1;
}

.glitch::after {
  animation: glitch-anim 3s infinite linear alternate-reverse;
  color: #FF5555;
  z-index: -2;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .terminal-navigator {
    display: none;
  }

  .terminal-output {
    padding: 1rem;
  }

  .platform-card {
    padding: 1rem;
  }

  .ascii-art {
    font-size: 0.6rem;
  }
}
```

---

## 🧩 Core Component Implementations

### Terminal Interface Component
```typescript
// src/components/terminal/TerminalInterface.tsx
import { useState, useEffect } from 'react';
import { CommandPrompt } from './CommandPrompt';
import { OutputDisplay } from './OutputDisplay';
import { Navigator } from './Navigator';
import { BootSequence } from './BootSequence';

export default function TerminalInterface() {
  const [isBooting, setIsBooting] = useState(true);
  const [currentSection, setCurrentSection] = useState('home');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  useEffect(() => {
    // Boot sequence completes after 3 seconds
    const timer = setTimeout(() => setIsBooting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCommand = (command: string) => {
    setCommandHistory([...commandHistory, command]);
    // Command routing logic here
  };

  if (isBooting) {
    return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="terminal-container">
      <Navigator
        currentSection={currentSection}
        onNavigate={setCurrentSection}
      />
      <div className="terminal-output">
        <OutputDisplay section={currentSection} history={commandHistory} />
        <CommandPrompt onCommand={handleCommand} />
      </div>
      <div className="terminal-scanline" />
    </div>
  );
}
```

### Command Parser
```typescript
// src/lib/commands/parser.ts
export interface Command {
  name: string;
  args: string[];
}

export function parseCommand(input: string): Command {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const name = parts[0] || '';
  const args = parts.slice(1);

  return { name, args };
}

export function validateCommand(command: Command): boolean {
  const validCommands = [
    'help', 'ls', 'cd', 'clear', 'pwd',
    'ssh', 'whoami', 'cat', 'neofetch',
    'fortune', 'matrix', 'konami', 'sl'
  ];

  return validCommands.includes(command.name);
}
```

### Command Router
```typescript
// src/lib/commands/router.ts
import type { Command } from './parser';

export interface CommandOutput {
  type: 'text' | 'component' | 'error' | 'redirect';
  content: string | React.ReactNode;
}

export function routeCommand(command: Command): CommandOutput {
  switch (command.name) {
    case 'help':
      return {
        type: 'text',
        content: getHelpText(),
      };

    case 'whoami':
      return {
        type: 'component',
        content: <WhoamiOutput />,
      };

    case 'ssh':
      const platform = command.args[0];
      return {
        type: 'redirect',
        content: getPlatformURL(platform),
      };

    case 'clear':
      return {
        type: 'text',
        content: '',
      };

    default:
      return {
        type: 'error',
        content: `Command not found: ${command.name}\nType 'help' for available commands.`,
      };
  }
}

function getHelpText(): string {
  return `
Available Commands:
─────────────────────────────────────
Navigation:
  help              Show this help message
  ls                List contents
  cd <section>      Change directory
  clear             Clear terminal
  pwd               Print working directory

Platform Access:
  ssh portfolio     Open Portfolio
  ssh labs          Open RECTOR LABS
  ssh cheatsheet    Open Cheatsheet
  ssh journal       Open Journal
  ssh dakwa         Open Da'wah Platform
  ssh quran         Open Quran Resources

Information:
  whoami            About RECTOR
  cat skills.json   Display skills
  neofetch          System info
  fortune           Random quote

Easter Eggs:
  matrix            Matrix effect
  sl                Train animation
  cowsay            Wisdom from cow
─────────────────────────────────────
  `;
}

function getPlatformURL(platform: string): string {
  const urls = {
    portfolio: 'https://portfolio.rectorspace.com',
    labs: 'https://labs.rectorspace.com',
    cheatsheet: 'https://cheatsheet.rectorspace.com',
    journal: 'https://journal.rectorspace.com',
    dakwa: 'https://dakwa.rectorspace.com',
    quran: 'https://quran.rectorspace.com',
  };

  return urls[platform] || '';
}
```

---

## 🎨 Animation Components

### Typewriter Text
```typescript
// src/components/animations/TypewriterText.tsx
import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

interface TypewriterTextProps {
  strings: string[];
  speed?: number;
  loop?: boolean;
  onComplete?: () => void;
}

export default function TypewriterText({
  strings,
  speed = 50,
  loop = false,
  onComplete,
}: TypewriterTextProps) {
  const el = useRef(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings,
      typeSpeed: speed,
      loop,
      onComplete,
      showCursor: true,
      cursorChar: '▊',
    });

    return () => typed.destroy();
  }, [strings, speed, loop, onComplete]);

  return <span ref={el} className="typewriter" />;
}
```

### Matrix Rain
```typescript
// src/components/animations/MatrixRain.tsx
import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  density?: 'low' | 'medium' | 'high';
  color?: string;
}

export default function MatrixRain({
  density = 'low',
  color = '#00FF41',
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = canvas.width / 20;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01';

    function draw() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = '15px JetBrains Mono';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    return () => clearInterval(interval);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10 z-0"
    />
  );
}
```

---

## 📊 Performance Optimization

### Code Splitting
```javascript
// Lazy load heavy components
const MatrixRain = lazy(() => import('./components/animations/MatrixRain'));
const ParticleSystem = lazy(() => import('./components/animations/ParticleSystem'));

// Use Suspense
<Suspense fallback={<div>Loading...</div>}>
  <MatrixRain />
</Suspense>
```

### Image Optimization
- Use WebP format for pixel art
- Lazy load images below fold
- Preload critical assets (MonkeDAO avatar)

### Bundle Size
- Tree shaking enabled
- Remove unused Tailwind utilities
- Minify CSS and JS in production

---

## 🚀 Deployment

### Build Command
```bash
npm run build
```

### Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── _astro/
```

### VPS Deployment (Week 2+)
```bash
# On VPS as 'homepage' user
cd ~/app
git pull origin main
npm ci --production
npm run build
pm2 restart homepage
```

---

**Document Status:** Technical reference for implementation

**Last Updated:** 2025-11-02
**Maintained by:** RECTOR

Bismillah! Build time! 🚀
