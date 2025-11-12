# Agent Guidelines for DedSec Dashboard

## Project Structure
- **Monorepo**: `dedsec/client` (React/Vite) + `dedsec/server` (Express/Socket.io)
- **Client**: React 19, Vite, TailwindCSS, React Router, Socket.io-client, Firebase Auth
- **Server**: Express, Socket.io, in-memory storage (no database yet)
- **Key Dependencies**:
  - WebGL/3D: `three`, `postprocessing`, `ogl`
  - UI Components: Custom React Bits-inspired components

## Build/Lint/Test Commands
- **Client Dev**: `cd dedsec/client && npm run dev` (runs on http://localhost:5173)
- **Server Dev**: `cd dedsec/server && npm run dev` (runs on http://localhost:3001)
- **Client Build**: `cd dedsec/client && npm run build`
- **Lint**: `cd dedsec/client && npm run lint`
- **Note**: No test suite configured yet

## Branding
- **Full Name**: DEDSEC X01
- **Short Name**: DEDSEC (all caps)
- **Design**: Minimal black and white aesthetic with subtle purple accents
- **No Emojis**: Keep UI clean and professional

## Design System

### Typography
- **Primary Font**: Inter (400, 500, 600, 700, 800, 900) - body text, UI elements
- **Display Font**: Space Grotesk (700, 800, 900) - headings only
- **Mono Font**: JetBrains Mono - code/terminal elements
- **Font Weights**: Use 500-700 for minimal look, avoid 800+ except for main heading

### Colors
- **Background**: Pure black `#000000`
- **Text**: White `#FFFFFF` with opacity variants (`/70`, `/80`)
- **Accent**: Purple `#B99FE3` (for PixelBlast background effects)
- **Buttons**:
  - Primary: White background, black text
  - Secondary: Black background, white border
- **Glass Elements**: `bg-white/5` with `backdrop-blur-xl` and `border-white/10`

### UI Patterns
- **Pill Buttons**: Rounded-full, minimal padding (`px-8 py-3`), small text (`text-sm`)
- **Glass Navbar**: Transparent pill-shaped with blur, minimal height
- **Pointer Events**: Use `pointer-events-none` on containers, `pointer-events-auto` on interactive elements to allow click-through to background
- **Spacing**: Keep minimal - avoid giant AI-generated billboard sizes

## Custom Components

### PixelBlast (`src/components/PixelBlast.jsx`)
- **Purpose**: WebGL-powered animated pixel background with ripple effects
- **Tech**: Three.js + postprocessing
- **Current Settings**:
  - `variant="square"`, `pixelSize={4}`
  - `color="#B99FE3"` (light purple)
  - `patternScale={3}`, `patternDensity={1}`
  - `speed={0.5}`, `edgeFade={0.05}`
  - `enableRipples={true}` (click to create ripples)
  - `liquid={false}` (liquid wobble disabled)
- **Usage**: Full-screen background on Landing page

### FaultyTerminal (`src/components/FaultyTerminal.jsx`)
- **Purpose**: Matrix-style terminal effect with glitch/scanlines
- **Tech**: OGL (lightweight WebGL library)
- **Features**: Scanlines, flicker, noise, curvature, mouse-reactive patterns
- **Status**: Available but not currently used (PixelBlast preferred)

### FuzzyText (`src/components/FuzzyText.jsx`)
- **Purpose**: Glitchy text effect with RGB shift
- **Tech**: Three.js shader-based text rendering
- **Settings**: `baseIntensity={0.2}`, `hoverIntensity={0.5}`, `enableHover={true}`
- **Usage**: 404 page ("404" and "ACCESS DENIED" text)

## Code Style
- **Imports**: Group by external → internal → relative; use destructuring
- **Components**: Function components with hooks; file names match component names (PascalCase.jsx)
- **Naming**: camelCase for variables/functions, PascalCase for components, SCREAMING_SNAKE_CASE for constants
- **Formatting**: 2-space indentation, semicolons required, single quotes preferred
- **Error Handling**: Return `{ success: boolean, error?: string }` pattern for async operations
- **Socket Events**: Use colon notation (e.g., `user:join`, `message:send`)
- **ESLint Rules**: Allow unused vars starting with uppercase/underscore

## Routes
- `/` - Landing page with PixelBlast background
- `/login` - Authentication
- `/dashboard` - Main dashboard
- `/profile` - User profile
- `/writeups` - CTF writeups
- `/announcements` - Team announcements
- `/stats` - Statistics
- `/admin` - Admin panel
- `*` - Custom 404 page (NotFound.jsx with FuzzyText)

## MCP Server
- **shadcn MCP**: Configured in `.mcp.json`
- **Purpose**: Access to shadcn/ui component documentation and installation
- **Usage**: Can install and use shadcn/ui components compatible with Tailwind

## Key Patterns
- Firebase auth via `dedsec/client/src/utils/firebase.js` exports
- Socket.io channels: `general`, `ops`, `intel`, `ai-lab`
- Environment vars: Use `import.meta.env.VITE_*` for client (Vite), `process.env.*` for server
- Glass morphism UI: `bg-white/5 backdrop-blur-xl border border-white/10`
- Click-through backgrounds: Container has `pointer-events-none`, interactive elements have `pointer-events-auto`
