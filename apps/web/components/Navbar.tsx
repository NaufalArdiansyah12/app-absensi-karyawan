"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Calendar, Search } from "lucide-react";

type Item = { key: string; title: string; sub: string; href: string };

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [atts, setAtts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [panel, setPanel] = useState<"search" | "notif" | null>(null);

  const target =
    user?.role === "HR" ? "/hr/approval" : user?.role === "FINANCE" ? "/finance/perhitungan" : "/gm/cuti";
  const attTarget =
    user?.role === "HR" ? "/hr/absensi" : user?.role === "FINANCE" ? "/finance/potongan" : "/gm/absensi";

  useEffect(() => {
    if (!user) return;
    Promise.all([fetch("/api/leaves/pending"), fetch("/api/attendance/history")])
      .then((rs) => Promise.all(rs.map((r) => r.json())))
      .then(([l, a]: any[]) => {
        setLeaves(l.pendingLeaves || []);
        setAtts(a.attendances || []);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setPanel(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const term = q.trim().toLowerCase();
  const results: Item[] = term
    ? [
        ...leaves.map((l) => ({ key: `l${l.id}`, title: l.userName, sub: `Cuti • ${l.type.replaceAll("_", " ")}`, href: target })),
        ...atts.map((a) => ({ key: `a${a.id}`, title: a.userName, sub: `Kehadiran • ${a.date}`, href: attTarget })),
      ]
        .filter((r) => r.title?.toLowerCase().includes(term))
        .slice(0, 8)
    : [];

  const go = (href: string) => {
    setPanel(null);
    setQ("");
    router.push(href);
  };

  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const dropdown =
    "absolute top-full z-40 mt-2 overflow-hidden rounded-2xl border border-white/80 bg-white p-2 shadow-xl";

  return (
    <header
      ref={ref}
      className="relative z-30 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/80 bg-white/80 px-6 py-3 shadow-sm backdrop-blur"
    >
      <div className="flex min-w-[300px] flex-1 items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-lg font-bold text-white">
            ✦
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Nutrilife</span>
        </div>
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            aria-label="Cari"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPanel("search");
            }}
            onFocus={() => setPanel("search")}
            placeholder="Cari karyawan, cuti, kehadiran..."
            className="w-full rounded-full border border-black/5 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm text-zinc-800 placeholder-zinc-400 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {panel === "search" && term && (
            <div className={`${dropdown} left-0 w-full`}>
              {results.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-zinc-400">Tidak ada hasil.</div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => go(r.href)}
                    className="flex w-full flex-col rounded-xl px-3 py-2 text-left hover:bg-zinc-50"
                  >
                    <span className="text-xs font-bold text-zinc-900">{r.title}</span>
                    <span className="text-[11px] text-zinc-500">{r.sub}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-black/5 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700">
          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
          <span>{today}</span>
        </div>

        <div className="relative">
          <button
            aria-label="Notifikasi"
            aria-expanded={panel === "notif"}
            onClick={() => setPanel(panel === "notif" ? null : "notif")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-zinc-50 text-zinc-600 transition-colors hover:bg-white"
          >
            <Bell className="h-4 w-4" />
            {leaves.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-bold text-white">
                {leaves.length}
              </span>
            )}
          </button>
          {panel === "notif" && (
            <div className={`${dropdown} right-0 w-72`}>
              <div className="px-3 py-2 text-xs font-bold text-zinc-900">Notifikasi</div>
              {leaves.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-zinc-400">Tidak ada notifikasi baru.</div>
              ) : (
                leaves.slice(0, 6).map((l) => (
                  <button key={l.id} onClick={() => go(target)} className="flex w-full flex-col rounded-xl px-3 py-2 text-left hover:bg-zinc-50">
                    <span className="text-xs font-bold text-zinc-900">{l.userName}</span>
                    <span className="text-[11px] text-zinc-500">
                      Mengajukan {l.type.replaceAll("_", " ")} • {l.durationDays} hari
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white bg-zinc-900 text-sm font-bold text-white shadow-sm">
            {(user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="hidden text-left leading-tight lg:block">
            <div className="text-xs font-bold text-zinc-900">{user?.name || "Memuat..."}</div>
            <div className="text-[11px] text-zinc-500">
              {user?.role || "GUEST"} • {user?.division || "DIV"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
