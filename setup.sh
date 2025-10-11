#!/bin/bash

# DedSec Project Setup Script
# Run this in your terminal where you want to create the project

echo "💀 DedSec - Initializing Project..."

# Create main project folder
mkdir dedsec
cd dedsec

# ========== FRONTEND SETUP ==========
echo "📦 Setting up React frontend with Vite..."
npm create vite@latest client -- --template react
cd client

# Install dependencies
echo "⚙️ Installing frontend dependencies..."
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom
npm install firebase
npm install lucide-react

# Initialize Tailwind
echo "🎨 Configuring Tailwind CSS..."
npx tailwindcss init -p

cd ..

# ========== BACKEND SETUP ==========
echo "🔧 Setting up Express backend..."
mkdir server
cd server

# Initialize Node.js project
npm init -y

# Install backend dependencies
echo "⚙️ Installing backend dependencies..."
npm install express socket.io cors dotenv
npm install -D nodemon

cd ..

# ========== CREATE FOLDER STRUCTURE ==========
echo "📁 Creating folder structure..."

# Client folders
mkdir -p client/src/components
mkdir -p client/src/pages
mkdir -p client/src/utils
mkdir -p client/src/hooks

# Server folders
mkdir -p server/routes
mkdir -p server/middleware

# ========== CREATE CONFIG FILES ==========

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Environment variables
.env
.env.local

# Build files
client/dist/
client/build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
EOF

# Create root README
cat > README.md << 'EOF'
# 💀 DedSec - Hacker CTF Command Center

## Setup Instructions

1. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Environment Variables:**
   - Copy `.env.example` to `.env` in the server folder
   - Add your Firebase credentials

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Express + Socket.io
- Auth: Firebase Authentication
- Real-time: Socket.io

## Project Structure
```
dedsec/
├── client/          # React frontend
├── server/          # Express backend
└── README.md
```
EOF

echo "✅ Project structure created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. cd dedsec"
echo "2. Follow the configuration steps I'll give you next"
echo ""
echo "💀 DedSec is ready for development!"