"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, User } from "lucide-react";

const DEMO_ROLES = [
  { id: "SU001", title: "Super User", desc: "Master Data & Config" },
  { id: "GM001", title: "General Manager", desc: "Approval Cuti Tahap 1" },
  { id: "HR001", title: "HR Specialist", desc: "Approval Final & Evaluasi" },
  { id: "FN001", title: "Finance Officer", desc: "Payroll & Slip Gaji" },
];

export default function LoginPage() {
  const router = useRouter();
  const [nikOrEmail, setNikOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e?: React.FormEvent, customUser?: { id: string; pass: string }) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const payload = customUser
      ? { nikOrEmail: customUser.id, password: customUser.pass }
      : { nikOrEmail, password };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      localStorage.setItem("nutrilife_user", JSON.stringify(data.user));
      localStorage.setItem("nutrilife_token", data.token);

      switch (data.user.role) {
        case "SUPER_USER":
          router.push("/super-user");
          break;
        case "GM":
          router.push("/gm");
          break;
        case "HR":
          router.push("/hr");
          break;
        case "FINANCE":
          router.push("/finance");
          break;
        case "EMPLOYEE":
          router.push("/hr");
          break;
        default:
          router.push("/gm");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (id: string, pass: string) => {
    setNikOrEmail(id);
    setPassword(pass);
    handleLogin(undefined, { id, pass });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#F5F3F0_0%,#E8E5E1_100%)] p-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl font-bold text-white shadow-md">
            ✦
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">Nutrilife HRIS</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Sistem Manajemen Kehadiran, Cuti & Payroll Terpadu
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-xs font-semibold text-zinc-600">
            NIK atau Email
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={nikOrEmail}
                onChange={(e) => setNikOrEmail(e.target.value)}
                placeholder="Contoh: GM001 atau hr@nutrilife.com"
                required
                className="w-full rounded-full border border-black/5 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </label>

          <label className="block text-xs font-semibold text-zinc-600">
            Password
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-full border border-black/5 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            <span>{loading ? "Memverifikasi..." : "Masuk ke Sistem"}</span>
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-200/70 pt-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Akses Cepat Demo Role
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2.5 text-xs">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={loading}
                onClick={() => quickLogin(r.id, "admin123")}
                className="group flex flex-col rounded-2xl border border-black/5 bg-white/90 p-3 text-left shadow-sm transition-all hover:border-zinc-950 hover:bg-zinc-950 disabled:opacity-50"
              >
                <div className="flex items-center justify-between font-bold text-zinc-900 group-hover:text-white">
                  <span>{r.title}</span>
                  <span className="text-[10px] font-medium text-zinc-400 group-hover:text-zinc-300">{r.id}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-zinc-500 group-hover:text-zinc-300">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
