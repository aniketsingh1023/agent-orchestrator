export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override the dashboard sidebar layout — canvas needs full screen
  return <div className="w-screen h-screen overflow-hidden">{children}</div>;
}
