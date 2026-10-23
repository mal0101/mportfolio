type IconProps = { size?: number; className?: string }

function Icon({ size = 16, className, d }: IconProps & { d: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}

export const ArrowUpRight = (p: IconProps) => <Icon {...p} d="M7 17 L17 7 M9 7 H17 V15" />
export const Copy = (p: IconProps) => <Icon {...p} d="M9 9 H19 V19 H9 Z M5 15 V5 H15" />
export const Check = (p: IconProps) => <Icon {...p} d="M5 12.5 L10 17 L19 7" />
