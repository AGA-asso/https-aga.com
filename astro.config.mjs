import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL : adresse publique du site, à définir dans Cloudflare une fois le domaine choisi.
export default defineConfig({
  site: process.env.SITE_URL || 'https://aga.example',
  trailingSlash: 'always',
  redirects: { '/': '/fr/' },
  integrations: [sitemap({ filter: (page) => !page.includes('/apercu/') })],
});
