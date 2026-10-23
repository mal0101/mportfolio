export function linkKind(url: string): "live demo" | "source" | "visit" {
  const host = new URL(url).hostname
  if (host.endsWith("vercel.app")) return "live demo"
  if (host === "github.com") return "source"
  return "visit"
}
