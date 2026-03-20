"use client";

import Image from "next/image";

/**
 * CtrlAI Logo — icon mark only (for navbar, sidebar, small placements)
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="CtrlAI"
      width={size}
      height={size}
      className="rounded-lg shrink-0"
    />
  );
}

/**
 * CtrlAI full wordmark on light background
 */
export function LogoFull({ height = 40 }: { height?: number }) {
  return (
    <Image
      src="/logo-light.png"
      alt="CtrlAI"
      width={Math.round(height * 2.25)}
      height={height}
      className="shrink-0 object-contain"
    />
  );
}

/**
 * CtrlAI full wordmark on dark background
 */
export function LogoDark({ height = 40 }: { height?: number }) {
  return (
    <Image
      src="/logo-dark.png"
      alt="CtrlAI"
      width={Math.round(height * 2.25)}
      height={height}
      className="shrink-0 object-contain"
    />
  );
}
