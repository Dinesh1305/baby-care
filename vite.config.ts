import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // We removed the COOP/COEP headers here to revert to 
    // the stable single-threaded SIMD backend.
  }
});