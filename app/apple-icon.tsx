import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// Ink square (no radius: iOS applies its own mask) with the M. mark, 120px wide, centred.
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><path d="M12 86 V16 L46 58 L80 16 V86" fill="none" stroke="#efedf5" stroke-width="12" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4"/><rect x="94" y="72" width="14" height="14" fill="#9469ff"/></svg>`

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0a0f",
      }}
    >
      <img src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`} width={120} height={100} alt="" />
    </div>,
    size,
  )
}
