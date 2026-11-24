import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { buildCsp, SECURITY_HEADERS } from "./src/lib/security/csp";

// Strict CSP + security headers: injected as <meta> into production builds and
// sent as real headers by `vite preview`. Dev keeps HMR working (no CSP meta).
const securityPlugin = (mode: string) => ({
  name: "security-headers",
  transformIndexHtml(html: string) {
    if (mode === "development") return html;
    const meta = `<meta http-equiv="Content-Security-Policy" content="${buildCsp({ forMeta: true })}" />`;
    return html.replace("<head>", `<head>\n    ${meta}`);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    headers: { ...SECURITY_HEADERS, "Content-Security-Policy": buildCsp() },
  },
  plugins: [
    securityPlugin(mode),
    react(),
    mcpPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
