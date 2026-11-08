"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

export const card = "rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur";
export const pill = "rounded-full px-2.5 py-1 text-[11px] font-semibold";
export const btnDark =
  "inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50";
export const linkBtn =
  "inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-950 hover:border-zinc-950 hover:text-white";
export const th = "pb-3 font-semibold";
export const input =
  "rounded-full border border-black/5 bg-zinc-50 px-4 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const MONTHS_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, onClose]);
}

export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const cur = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2.5 rounded-full border border-zinc-200/80 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition-all hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <span className="truncate">{cur?.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 max-h-60 min-w-full w-max max-w-xs overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-xl">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  active ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span className="truncate">{o.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Semua Tanggal",
  ariaLabel = "Filter tanggal",
  clearable = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  clearable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const initDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [cursor, setCursor] = useState(new Date(initDate.getFullYear(), initDate.getMonth(), 1));

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const cells = [
    ...Array(cursor.getDay()).fill(null),
    ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1),
  ];

  const fmtDisplay = (iso: string) => {
    if (!iso) return placeholder;
    const [yy, mm, dd] = iso.split("-").map(Number);
    return `${String(dd).padStart(2, "0")} ${MONTHS_SHORT[(mm || 1) - 1]} ${yy}`;
  };

  const todayIso = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  };

  return (
    <div ref={ref} className="relative">
      <div className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white shadow-sm transition-all hover:border-zinc-300">
        <button
          type="button"
          aria-label={ariaLabel}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-800 focus:outline-none"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
          <span>{fmtDisplay(value)}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {clearable && value && (
          <button
            type="button"
            aria-label="Reset tanggal"
            onClick={() => onChange("")}
            className="mr-2 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-64 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900">
              {MONTHS_FULL[m]} {y}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Bulan sebelumnya"
                onClick={() => setCursor(new Date(y, m - 1, 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Bulan berikutnya"
                onClick={() => setCursor(new Date(y, m + 1, 1))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div key={d} className="py-1 font-semibold text-zinc-400">{d}</div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const sel = iso === value;
              const isToday = iso === todayIso();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`rounded-xl py-1.5 font-semibold transition-colors ${
                    sel
                      ? "bg-zinc-950 text-white shadow-sm"
                      : isToday
                      ? "border border-zinc-300 font-bold text-zinc-950 hover:bg-zinc-100"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {String(d).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-[11px] font-semibold">
            {clearable ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-zinc-500 hover:text-zinc-900"
              >
                Semua Tanggal
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => {
                const t = todayIso();
                const n = new Date();
                setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
                onChange(t);
                setOpen(false);
              }}
              className="text-zinc-900 underline"
            >
              Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MonthPicker({
  value,
  onChange,
  ariaLabel = "Pilih bulan",
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const [yy, mm] = (value || "2026-11").split("-").map(Number);
  const [yr, setYr] = useState(yy || new Date().getFullYear());

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition-all hover:border-zinc-300 focus:outline-none"
      >
        <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
        <span>{MONTHS_FULL[(mm || 1) - 1]} {yy}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-60 rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900">Tahun {yr}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setYr((y) => y - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setYr((y) => y + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            {MONTHS_SHORT.map((mName, idx) => {
              const iso = `${yr}-${String(idx + 1).padStart(2, "0")}`;
              const sel = iso === value;
              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`rounded-xl py-2 font-semibold transition-colors ${
                    sel ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {mName}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const isCuti = (l: any) => l.type === "CUTI_TAHUNAN";
export const typeLabel = (t: string) => t.replaceAll("_", " ");

export function PageHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
      <p className="mt-1 text-xs text-zinc-500">{desc}</p>
    </div>
  );
}

export function Empty({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-8 text-center text-zinc-400">{text}</td>
    </tr>
  );
}

export function AttBadge({ status, late }: { status: string; late?: number }) {
  if (status === "CUTI") {
    return <span className={`${pill} bg-blue-50 text-blue-600`}>Cuti</span>;
  }
  if (status === "IZIN_SAKIT") {
    return <span className={`${pill} bg-amber-50 text-amber-600`}>Izin Sakit</span>;
  }
  if (status === "IZIN") {
    return <span className={`${pill} bg-amber-50 text-amber-600`}>Izin</span>;
  }
  if (status === "BELUM_ABSEN") {
    return <span className={`${pill} bg-zinc-100 text-zinc-600`}>Belum Absen</span>;
  }
  if (status === "ALFA") {
    return <span className={`${pill} bg-rose-100 text-rose-700`}>Alfa</span>;
  }
  const ok = status === "TEPAT_WAKTU";
  return (
    <span className={`${pill} ${ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
      {ok ? "Tepat Waktu" : "Terlambat"}
      {late ? ` (+${late} mnt)` : ""}
    </span>
  );
}

const LEAVE_STATUS: Record<string, [string, string]> = {
  MENUNGGU_GM: ["Menunggu GM", "bg-amber-50 text-amber-600"],
  MENUNGGU_HR: ["Menunggu HR", "bg-blue-50 text-blue-600"],
  FINAL_DISETUJUI: ["Disetujui", "bg-emerald-50 text-emerald-600"],
  DITOLAK_GM: ["Ditolak GM", "bg-rose-50 text-rose-600"],
  DITOLAK_HR: ["Ditolak HR", "bg-rose-50 text-rose-600"],
};

export function LeaveBadge({ status }: { status: string }) {
  const [label, cls] = LEAVE_STATUS[status] || [status, "bg-zinc-100 text-zinc-600"];
  return <span className={`${pill} ${cls}`}>{label}</span>;
}

export function Kpi({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon: any }) {
  return (
    <div className="flex flex-col gap-1 rounded-[22px] border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight text-zinc-900">{value}</div>
    </div>
  );
}

export function Bar({ pct, className = "w-24" }: { pct: number; className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-1.5 overflow-hidden rounded-full bg-zinc-100 ${className}`}>
        <div className="h-full rounded-full bg-zinc-900" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-zinc-500">{pct}%</span>
    </div>
  );
}

export function CalendarWidget() {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const cells = [
    ...Array(cursor.getDay()).fill(null),
    ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1),
  ];
  const isToday = (d: number) => d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
  const move = (n: number) => setCursor(new Date(y, m + n, 1));
  const nav = "flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900";

  return (
    <div className={`${card} flex flex-col gap-4`}>
      <div>
        <h2 className="text-base font-bold text-zinc-900">Kalender</h2>
        <p className="text-xs text-zinc-500">Jadwal operasional bulan ini</p>
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-bold text-zinc-900">
          {cursor.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        </span>
        <div className="flex items-center gap-1">
          <button aria-label="Bulan sebelumnya" onClick={() => move(-1)} className={nav}><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button aria-label="Bulan berikutnya" onClick={() => move(1)} className={nav}><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
          <div key={d} className="py-1 text-[11px] font-semibold text-zinc-400">{d}</div>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`py-1.5 ${
              d && isToday(d) ? "rounded-xl border border-zinc-200 bg-white font-bold text-zinc-950 shadow-sm" : "text-zinc-600"
            }`}
          >
            {d ? String(d).padStart(2, "0") : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function useGMData() {
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const rs = await Promise.all([
        fetch("/api/master/users"),
        fetch("/api/leaves/pending?all=1"),
        fetch("/api/attendance/history"),
        fetch("/api/master/shifts"),
      ]);
      const [u, l, a, s]: any[] = await Promise.all(rs.map((r) => r.json()));
      setUsers(u.users || []);
      setLeaves(l.pendingLeaves || []);
      setAttendances(a.attendances || []);
      setShifts(s.shifts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { users, leaves, attendances, shifts, loading, reload };
}

export type DisciplineRow = {
  user: any;
  hadir: number;
  tepat: number;
  telat: number;
  menitTelat: number;
  pct: number;
};

export function discipline(users: any[], attendances: any[]): DisciplineRow[] {
  return users
    .filter((u) => u.role === "EMPLOYEE")
    .map((user) => {
      const rows = attendances.filter(
        (a) => a.userId === user.id && (a.status === "TEPAT_WAKTU" || a.status === "TERLAMBAT")
      );
      const tepat = rows.filter((a) => a.status === "TEPAT_WAKTU").length;
      return {
        user,
        hadir: rows.length,
        tepat,
        telat: rows.length - tepat,
        menitTelat: rows.reduce((s, a) => s + (a.lateMinutes || 0), 0),
        pct: rows.length ? Math.round((tepat / rows.length) * 100) : 0,
      };
    });
}
