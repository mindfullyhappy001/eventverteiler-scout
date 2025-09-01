import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Custom plugin to inject "built by scout" tag
function injectBuiltByScoutPlugin() {
  return {
    name: 'inject-built-by-scout',
    transformIndexHtml(html: string) {
      const scriptTag = '<script defer src="/scout-tag.js"></script>';
      return html.replace('</body>', scriptTag + '\n  </body>');
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), injectBuiltByScoutPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Bridge native Vercel↔Supabase env names into Vite's client-exposed VITE_* vars
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.PUBLIC_SUPABASE_URL ||
      ''
    ),
    'import.meta.env.VITE_SUPABASE_ANON': JSON.stringify(
      process.env.VITE_SUPABASE_ANON ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.PUBLIC_SUPABASE_ANON_KEY ||
      ''
    ),
  },
});
