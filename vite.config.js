import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the site work from any GitHub Pages sub-path (user.github.io/repo-name)
export default defineConfig({
  base: './',
  plugins: [react()],
});
