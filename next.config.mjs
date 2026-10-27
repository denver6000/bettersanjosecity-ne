export const PHP_DEV_PORT = 8090;

const isDev = process.env.NODE_ENV === 'development';

// A plain object, not a function, so hosting builders that read the config
// directly (Hostinger) see `output: 'export'` and pick up `out/`.
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export to `out/` so the site runs on Hostinger shared hosting
  // (plain Apache, no Node process). trailingSlash emits services/index.html, which
  // Apache serves as a directory index; Next also writes a services/ folder of
  // navigation payloads, so a flat services.html would be shadowed by that folder.
  // Export only applies to `next build`; the dev server ignores it.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,

  // In production Apache runs public/api/*.php directly. In development,
  // scripts/dev.mjs starts `php -S` and this forwards those requests to it.
  // It must be `beforeFiles`: otherwise Next serves the .php file from public/
  // as plain text before the rewrite is ever tried.
  ...(isDev && {
    async rewrites() {
      return {
        beforeFiles: [
          {
            source: '/api/:file.php',
            destination: `http://127.0.0.1:${PHP_DEV_PORT}/api/:file.php`,
          },
        ],
      };
    },
  }),
};

export default nextConfig;
