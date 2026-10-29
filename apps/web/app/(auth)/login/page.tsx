"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

      // Simpan session di localStorage untuk client-side convenience
      localStorage.setItem("nutrilife_user", JSON.stringify(data.user));
      localStorage.setItem("nutrilife_token", data.token);

      // Redirect berdasarkan role
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
          // Untuk web, direct ke employee portal preview
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
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-800">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-lg">
            NL
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">NUTRILIFE HRIS</h2>
          <p className="text-xs text-slate-500">Sistem Kehadiran & Penggajian Terpadu</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600">NIK atau Email</label>
            <input
              type="text"
              value={nikOrEmail}
              onChange={(e) => setNikOrEmail(e.target.value)}
              placeholder="Contoh: SU001 atau hr@nutrilife.com"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </button>
        </form>

        {/* Akses Cepat Demo / Testing */}
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Akses Cepat Pengujian Role (Demo)
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => quickLogin("SU001", "admin123")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100"
            >
              <div className="font-bold text-slate-800">Super User</div>
              <div className="text-[10px] text-slate-500">Master Data & Config</div>
            </button>
            <button
              onClick={() => quickLogin("GM001", "admin123")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100"
            >
              <div className="font-bold text-slate-800">General Manager</div>
              <div className="text-[10px] text-slate-500">Approval Cuti Tahap 1</div>
            </button>
            <button
              onClick={() => quickLogin("HR001", "admin123")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100"
            >
              <div className="font-bold text-slate-800">HR Specialist</div>
              <div className="text-[10px] text-slate-500">Verifikasi Foto/GPS & Final Cuti</div>
            </button>
            <button
              onClick={() => quickLogin("FN001", "admin123")}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100"
            >
              <div className="font-bold text-slate-800">Finance Officer</div>
              <div className="text-[10px] text-slate-500">Hitung & Terbitkan Payroll</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
