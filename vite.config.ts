import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Verify environment variables are loaded
  if (!process.env.MODAL_API_URL) {
    console.error('MODAL_API_URL is not defined in environment variables');
    process.exit(1);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api/scrape': {
          target: process.env.MODAL_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/scrape', '/scrape'),
          headers: {
            'Authorization': `Bearer ${process.env.MODAL_API_KEY}`
          },
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying to:', proxyReq.path);
            });
          }
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
