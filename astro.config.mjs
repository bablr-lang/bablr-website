import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import starlight from "@astrojs/starlight";

import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [starlight({
    title: "DOCS",
    logo: { src: "./src/images/BABLRTransparent.png" },
    prerender: false,
    favicon: "/favicon.ico",
  }), qwikdev()],
  server: { port: 8080 },
  site: "https://bablr.org",
  output: "server",

  adapter: node({
    mode: "standalone",
  }),
});