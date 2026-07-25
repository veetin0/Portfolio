/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` and `next build` both write to the same directory, so running a
  // build while a dev server is live corrupts its chunks and the page renders
  // half-styled. Set NEXT_DIST_DIR to build into a scratch directory instead:
  //
  //   NEXT_DIST_DIR=.next-verify npm run build
  //
  // See `npm run verify`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
}

export default nextConfig
