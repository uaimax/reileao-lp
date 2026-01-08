import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Portas configuráveis via variáveis de ambiente
  const FRONTEND_PORT = parseInt(process.env.VITE_PORT || process.env.PORT || '5173', 10);
  const API_PORT = parseInt(process.env.VITE_API_PORT || '3002', 10);
  const API_URL = process.env.VITE_API_URL || `http://localhost:${API_PORT}`;

  return {
    server: {
      host: "::",
      port: FRONTEND_PORT,
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
