import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    allowedHosts: [
      'd019-111-92-45-20.ngrok-free.app', // Allow this specific Ngrok host
      '.ngrok-free.app', // Allow all Ngrok hosts (recommended for development)
    ],
  }
});
