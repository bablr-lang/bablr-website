import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import solidJs from "@astrojs/solid-js";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  i18n: {
    prefixDefaultLocale: false,
    locales: ["en"],
    defaultLocale: "en",
  },
  redirects: {
    "/experiments/playground": "/playground",
  },
  integrations: [solidJs(), mdx()],
  server: { port: 8080 },
  site: "https://bablr.org",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    optimizeDeps: {},
  },
});
