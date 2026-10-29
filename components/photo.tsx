import { getImageProps, type StaticImageData } from "next/image"

/**
 * Two layers with the same optimized URL (fetched once): the colour image, and a grayscale "daylight" copy on top
 * with a lamp-shaped hole at the pointer (CSS --lx/--ly/--lr; the pointer tracking lives in
 * components/page-observers.tsx). Server component: getImageProps() adds no client JS. Only the colour layer carries
 * alt text and the blur placeholder.
 */
export function Photo({ img, alt, sizes }: { img: StaticImageData; alt: string; sizes: string }) {
  const { props: colour } = getImageProps({ src: img, alt, sizes, loading: "lazy", placeholder: "blur" })
  const { props: day } = getImageProps({ src: img, alt: "", sizes, loading: "lazy" })
  return (
    <span className="photo">
      {/* eslint-disable-next-line @next/next/no-img-element -- props come from next/image getImageProps */}
      <img {...colour} alt={alt} className="photo-colour" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative grayscale copy, same URL */}
      <img {...day} alt="" className="photo-day" />
    </span>
  )
}
