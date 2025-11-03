# Agent Guidelines for DedSec Dashboard

## Project Structure
- **Monorepo**: `dedsec/client` (React/Vite) + `dedsec/server` (Express/Socket.io)
- **Client**: React 19, Vite, TailwindCSS, React Router, Socket.io-client, Firebase Auth
- **Server**: Express, Socket.io, in-memory storage (no database yet)

## Build/Lint/Test Commands
- **Client Dev**: `cd dedsec/client && npm run dev` (runs on http://localhost:5173)
- **Server Dev**: `cd dedsec/server && npm run dev` (runs on http://localhost:3001)
- **Client Build**: `cd dedsec/client && npm run build`
- **Lint**: `cd dedsec/client && npm run lint`
- **Note**: No test suite configured yet

## Code Style
- **Imports**: Group by external → internal → relative; use destructuring
- **Components**: Function components with hooks; file names match component names (PascalCase.jsx)
- **Naming**: camelCase for variables/functions, PascalCase for components, SCREAMING_SNAKE_CASE for constants
- **Formatting**: 2-space indentation, semicolons required, single quotes preferred
- **Error Handling**: Return `{ success: boolean, error?: string }` pattern for async operations
- **Socket Events**: Use colon notation (e.g., `user:join`, `message:send`)
- **ESLint Rules**: Allow unused vars starting with uppercase/underscore

## Key Patterns
- Firebase auth via `dedsec/client/src/utils/firebase.js` exports
- Socket.io channels: `general`, `ops`, `intel`, `ai-lab`
- Environment vars: Use `import.meta.env.VITE_*` for client (Vite), `process.env.*` for server
