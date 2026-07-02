/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site in `out/` — ideal for Netlify hosting.
  output: 'export',
  images: { unoptimized: true },
  // Emit routes as folders (/thank-you/index.html) so form redirects and
  // direct visits resolve on any static host without pretty-URL rewrites.
  trailingSlash: true,
};

export default nextConfig;
