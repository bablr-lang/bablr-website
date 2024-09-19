import { defineConfig } from "astro/config";

// import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [],
  server: { port: 8080 },
  site: "https://bablr-website.fly.dev",
  output: "server",
});
