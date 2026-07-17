import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        produits: resolve(__dirname, 'produits.html'),
        produit: resolve(__dirname, 'produit.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html'),
      },
    },
  },
});
