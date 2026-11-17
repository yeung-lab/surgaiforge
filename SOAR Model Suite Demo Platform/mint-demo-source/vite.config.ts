import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api is proxied to the local FastAPI backend on :8010. We used :8000
// historically, but that port is contested on dev laptops (python -m http.server,
// Flask defaults, demo projects). :8010 is uncontested. In production (or when
// pointing at a Colab tunnel), the app calls an absolute backend URL configured
// at runtime — see src/api/client.ts. The bundled .app picks a free port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8010",
    },
  },
});
