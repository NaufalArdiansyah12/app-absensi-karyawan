"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Arahkan ke /login secara default
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-emerald-400">NUTRILIFE HRIS</h1>
        <p className="mt-2 text-sm text-slate-400">Memuat sistem...</p>
      </div>
    </div>
  );
}
