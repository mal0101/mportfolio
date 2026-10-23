/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // Photos (assets/photos, static imports) are served as AVIF, then WebP, then the stripped JPEG.
  images: { formats: ["image/avif", "image/webp"] },
}

export default nextConfig
