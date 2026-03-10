import Image from "next/image"

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt="Bookzeno logo"
      width={size}
      height={size}
      priority
    />
  )
}

