"use client";

import Image from "next/image";

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

export function LogoFull({ height = 40 }: { height?: number }) {
  const width = Math.round(height * 2.25);
  return (
    <div className="flex items-center gap-0 shrink-0">
      <Image
        src="/logo-light.png"
        alt="CtrlAI"
        width={width}
        height={height}
        className="object-contain object-left"
        style={{ height, width: "auto", maxHeight: height }}
      />
    </div>
  );
}

export function LogoDark({ height = 40 }: { height?: number }) {
  const width = Math.round(height * 2.25);
  return (
    <Image
      src="/logo-dark.png"
      alt="CtrlAI"
      width={width}
      height={height}
      className="shrink-0 object-contain"
      style={{ height, width: "auto", maxHeight: height }}
    />
  );
}
