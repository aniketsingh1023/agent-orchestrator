"use client";

/**
 * CtrlAI Logo component — renders the icon mark from the logo.jpeg
 * by showing only the top-left icon portion of the full brand sheet.
 */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.jpeg"
        alt="CtrlAI"
        style={{
          width: size * 3.2,
          height: "auto",
          objectFit: "cover",
          objectPosition: "0% 0%",
          marginTop: `-${size * 0.05}px`,
        }}
      />
    </div>
  );
}
