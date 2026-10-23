import "@testing-library/jest-dom/vitest"
import { beforeEach } from "vitest"

class MockIO {
  root = null
  rootMargin = ""
  thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
class MockRO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, configurable: true, value: MockIO })
Object.defineProperty(window, "ResizeObserver", { writable: true, configurable: true, value: MockRO })
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }),
})
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"]

// The boot script and the lamp read storage; jsdom provides both, start each test clean.
beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  delete document.documentElement.dataset.intro
  delete document.documentElement.dataset.lamp
})
