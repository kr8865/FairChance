export default function FloatingBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-gold-500/20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl animate-float" />
      <div className="absolute inset-0 bg-mesh-emerald" />
    </div>
  );
}
