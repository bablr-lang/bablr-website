import { defineConfig } from 'astro/config';

import node from '@astrojs/node';

// import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [],
  server: { port: 8080 },
  site: 'https://bablr-website.fly.dev',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});