import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import solidJs from "@astrojs/solid-js";

import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

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
  integrations: [mdx(), 
    react({
    include: ['**/react/*'],
  }),
  solidJs({
    include: ['**/solid/*'],
  })],
  server: { port: 8080 },
  site: "https://bablr.org",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    optimizeDeps: {},
    plugins: [tailwindcss()],
  },
});