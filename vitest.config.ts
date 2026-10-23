import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  plugins: [
    {
      // Static image imports (data/photos.ts) resolve to a StaticImageData-shaped stub in tests.
      name: "static-image-stub",
      enforce: "pre",
      load(id) {
        if (/\.(jpe?g|png|webp|avif)$/.test(id))
          return `export default { src: "/stub/${path.basename(id)}", width: 800, height: 1000, blurDataURL: "data:image/jpeg;base64,AA==" }`
      },
    },
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
})
