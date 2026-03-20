"use client";

import Image from "next/image";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="CtrlAI"
      width={size}
      height={size}
      className="rounded-lg shrink-0"
    />
  );
}

export function LogoFull({ height = 32 }: { height?: number }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Image
        src="/logo.png"
        alt="CtrlAI"
        width={height}
        height={height}
        className="rounded-lg"
      />
      <span className="font-bold text-lg tracking-tight text-neutral-900">CtrlAI</span>
    </div>
  );
}

export function LogoDark({ height = 32 }: { height?: number }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Image
        src="/logo.png"
        alt="CtrlAI"
        width={height}
        height={height}
        className="rounded-lg"
      />
      <span className="font-bold text-lg tracking-tight text-white">CtrlAI</span>
    </div>
  );
}
