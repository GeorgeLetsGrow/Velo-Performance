/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a fully static site in `out/` — ideal for Netlify hosting.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
