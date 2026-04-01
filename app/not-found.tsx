import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="relative z-10 text-center space-y-4">
        <p className="font-mono text-[10px] text-neon/60 tracking-widest">ERROR 404</p>
        <h1 className="font-michroma text-5xl text-off-white">NOT FOUND</h1>
        <p className="font-mono text-xs text-[#555]">This page doesn't exist in the system.</p>
        <Link href="/" className="inline-block btn-neon px-8 py-3.5 font-michroma text-xs tracking-widest rounded-none mt-4">
          ← Return Home
        </Link>
      </div>
    </main>
  );
}
