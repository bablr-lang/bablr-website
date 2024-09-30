import { defineConfig } from "astro/config";

import node from "@astrojs/node";

import starlight from "@astrojs/starlight";

// import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "BABLR docs",
      logo: { src: "./src/images/BABLRTransparent.png", replacesTitle: true },
      prerender: false,
      favicon: "/favicon.ico",
    }),
  ],
  server: { port: 8080 },
  site: "https://bablr.org",
  output: "server",

  adapter: node({
    mode: "standalone",
  }),
});
