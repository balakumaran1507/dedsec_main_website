import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses including LAN and public
    allowedHosts: [
      '804166dc8320.ngrok-free.app',
      '.ngrok-free.app', // Allow all ngrok subdomains
      '.ngrok.io', // Legacy ngrok domains
      'localhost'
    ],
    // Optional: configure CORS if needed
    cors: true
  }
});
