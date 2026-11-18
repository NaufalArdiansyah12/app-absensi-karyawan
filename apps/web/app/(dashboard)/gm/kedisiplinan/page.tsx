"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  Gauge,
  Search,
  ShieldAlert,
  Timer,
  UserX,
} from "lucide-react";
import Modal from "@/components/Modal";
import {
  AttBadge,
  Bar,
  Empty,
  Kpi,
  MonthPicker,
  PageHead,
  Select,
  btnDark,
  card,
  input,
  linkBtn,
  pill,
  th,
  useGMData,
} from "@/components/gm-shared";

export type RiskLevel = "SAFE" | "WARNING" | "CRITICAL";

export interface DisciplineStat {
  user: any;
  hadir: number;
  tepat: number;
  telat: number;
  alfa: number;
  izin: number;
  cuti: number;
  menitTelat: number;
  pct: number;
  risk: RiskLevel;
  riskLabel: string;
}

export default function DisciplinePage() {
  const { users, attendances } = useGMData();
  const [sel, setSel] = useState<DisciplineStat | null>(null);

  // Filter states
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [division, setDivision] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Divisi unik dari data karyawan
  const divisionOptions = useMemo(() => {
    const set = new Set<string>();
    users.filter((u) => u.role === "EMPLOYEE" && u.division).forEach((u) => set.add(u.division));
    return [
      { value: "ALL", label: "Semua Divisi" },
      ...Array.from(set).map((d) => ({ value: d, label: d })),
    ];
  }, [users]);

  // Hitung disiplin per karyawan berdasarkan filter periode bulan
  const stats = useMemo(() => {
    const employees = users.filter((u) => u.role === "EMPLOYEE");

    return employees.map((user): DisciplineStat => {
      const userAtt = attendances.filter((a) => {
        if (a.userId !== user.id) return false;
        if (month && a.date && !a.date.startsWith(month)) return false;
        return true;
      });

      const hadirRows = userAtt.filter(
        (a) => a.status === "TEPAT_WAKTU" || a.status === "TERLAMBAT"
      );
      const tepat = hadirRows.filter((a) => a.status === "TEPAT_WAKTU").length;
      const telat = hadirRows.filter((a) => a.status === "TERLAMBAT").length;
      const alfa = userAtt.filter((a) => a.status === "ALFA").length;
      const izin = userAtt.filter((a) => a.status === "IZIN" || a.status === "IZIN_SAKIT").length;
      const cuti = userAtt.filter((a) => a.status === "CUTI").length;
      const menitTelat = hadirRows.reduce((s, a) => s + (a.lateMinutes || 0), 0);
      const pct = hadirRows.length ? Math.round((tepat / hadirRows.length) * 100) : 0;

      let risk: RiskLevel = "SAFE";
      let riskLabel = "Aman";
      if (telat >= 3 || alfa >= 1) {
        risk = "CRITICAL";
        riskLabel = "Kritis (Rekomendasi SP)";
      } else if (telat > 0) {
        risk = "WARNING";
        riskLabel = "Perhatian";
      }

      return {
        user,
        hadir: hadirRows.length,
        tepat,
        telat,
        alfa,
        izin,
        cuti,
        menitTelat,
        pct,
        risk,
        riskLabel,
      };
    });
  }, [users, attendances, month]);

  // Filter baris untuk tabel
  const filteredRows = useMemo(() => {
    return stats
      .filter((r) => {
        if (division !== "ALL" && r.user.division !== division) return false;
        if (riskFilter !== "ALL" && r.risk !== riskFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const matchName = r.user.name?.toLowerCase().includes(q);
          const matchNik = r.user.nik?.toLowerCase().includes(q);
          if (!matchName && !matchNik) return false;
        }
        return true;
      })
      .sort((a, b) => b.telat - a.telat || b.menitTelat - a.menitTelat || a.pct - b.pct);
  }, [stats, division, riskFilter, search]);

  // Ringkasan KPI Eksekutif GM
  const kpiData = useMemo(() => {
    const active = stats.filter((r) => r.hadir > 0);
    const avgOnTime = active.length
      ? Math.round(active.reduce((s, r) => s + r.pct, 0) / active.length)
      : 100;
    const totalMenit = stats.reduce((s, r) => s + r.menitTelat, 0);
    const totalAlfa = stats.reduce((s, r) => s + r.alfa, 0);
    const criticalCount = stats.filter((r) => r.risk === "CRITICAL").length;

    const jam = Math.floor(totalMenit / 60);
    const sisaMenit = totalMenit % 60;
    const jamHilangStr = jam > 0 ? `${jam}j ${sisaMenit}m` : `${sisaMenit} mnt`;

    return { avgOnTime, jamHilangStr, totalAlfa, criticalCount };
  }, [stats]);

  // Performa Disiplin per Divisi (untuk GM mengevaluasi Head/Manager Divisi)
  const divisionRankings = useMemo(() => {
    const groups: Record<string, { totalHadir: number; tepat: number; telat: number; count: number }> = {};

    stats.forEach((r) => {
      const d = r.user.division || "Tanpa Divisi";
      if (!groups[d]) groups[d] = { totalHadir: 0, tepat: 0, telat: 0, count: 0 };
      groups[d].count += 1;
      groups[d].totalHadir += r.hadir;
      groups[d].tepat += r.tepat;
      groups[d].telat += r.telat;
    });

    return Object.entries(groups)
      .map(([div, val]) => {
        const rate = val.totalHadir > 0 ? Math.round((val.tepat / val.totalHadir) * 100) : 100;
        return { division: div, ...val, rate };
      })
      .sort((a, b) => a.rate - b.rate); // Terendah di atas agar GM waspada
  }, [stats]);

  // Top 5 Pelanggar Kronis
  const topOffenders = useMemo(() => {
    return [...stats]
      .filter((r) => r.telat > 0 || r.alfa > 0)
      .sort((a, b) => b.telat * 60 + b.menitTelat + b.alfa * 120 - (a.telat * 60 + a.menitTelat + a.alfa * 120))
      .slice(0, 5);
  }, [stats]);

  // Ekspor CSV Native
  const exportCSV = () => {
    const header = ["NIK", "Nama", "Divisi", "Hadir", "Tepat Waktu", "Terlambat", "Menit Telat", "Alfa", "Izin", "Cuti", "On-Time %", "Status Risiko"];
    const lines = filteredRows.map((r) => [
      `"${r.user.nik || ""}"`,
      `"${r.user.name || ""}"`,
      `"${r.user.division || ""}"`,
      r.hadir,
      r.tepat,
      r.telat,
      r.menitTelat,
      r.alfa,
      r.izin,
      r.cuti,
      `${r.pct}%`,
      `"${r.riskLabel}"`,
    ]);
    const csvContent = [header.join(","), ...lines.map((l) => l.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-kedisiplinan-${month || "semua"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHead
          title="Monitoring Kedisiplinan"
          desc="Tinjauan eksekutif ketepatan waktu, jam kerja hilang, dan mitigasi pelanggaran disiplin."
        />
        <div className="flex items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <button onClick={exportCSV} className={linkBtn} title="Download format CSV">
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Eksekutif */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Rata-rata Tepat Waktu" value={`${kpiData.avgOnTime}%`} icon={Gauge} />
        <Kpi label="Total Jam Terlambat" value={kpiData.jamHilangStr} icon={Timer} />
        <Kpi label="Total Mangkir (Alfa)" value={kpiData.totalAlfa} icon={UserX} />
        <Kpi
          label="Karyawan Kritis (SP)"
          value={
            <span className={kpiData.criticalCount > 0 ? "text-rose-600" : "text-zinc-900"}>
              {kpiData.criticalCount}
            </span>
          }
          icon={ShieldAlert}
        />
      </div>

      {/* 2 Kolom Ringkasan: Divisi & Top Pelanggar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Peringkat Disiplin per Divisi */}
        <div className={`${card} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Kedisiplinan per Divisi</h2>
              <p className="text-xs text-zinc-500">Evaluasi ketepatan waktu tim (prioritas perhatian GM)</p>
            </div>
            <Building2 className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="space-y-3">
            {divisionRankings.length === 0 && (
              <div className="py-6 text-center text-xs text-zinc-400">Belum ada data divisi.</div>
            )}
            {divisionRankings.map((d) => (
              <div key={d.division} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs">
                <div className="mb-1.5 flex items-center justify-between font-semibold">
                  <span className="text-zinc-800">{d.division}</span>
                  <span className={d.rate < 85 ? "font-bold text-rose-600" : "text-zinc-700"}>
                    {d.rate}% Tepat ({d.telat}x Telat)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      d.rate >= 90 ? "bg-emerald-500" : d.rate >= 75 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${d.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watchlist Pelanggar Kronis */}
        <div className={`${card} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Watchlist Karyawan (Top Pelanggaran)</h2>
              <p className="text-xs text-zinc-500">Karyawan dengan frekuensi telat & alfa tertinggi</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="space-y-2.5">
            {topOffenders.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-400">
                Semua karyawan tepat waktu pada periode ini.
              </div>
            )}
            {topOffenders.map((r) => (
              <div
                key={r.user.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-3 shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">{r.user.name}</div>
                  <div className="text-[11px] text-zinc-400">
                    {r.user.division} • {r.telat}x telat ({r.menitTelat} mnt){r.alfa > 0 ? ` • ${r.alfa}x Alfa` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`${pill} ${
                      r.risk === "CRITICAL"
                        ? "bg-rose-50 text-rose-600"
                        : r.risk === "WARNING"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {r.riskLabel}
                  </span>
                  <button onClick={() => setSel(r)} className={linkBtn}>
                    Cek
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Utama & Filter Bar */}
      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Data Kedisiplinan Karyawan</h2>
            <p className="text-xs text-zinc-500">Daftar lengkap kehadiran, ketepatan, dan status tindakan</p>
          </div>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama / NIP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${input} pl-8 w-44`}
              />
            </div>
            <Select
              value={division}
              onChange={setDivision}
              options={divisionOptions}
              ariaLabel="Filter divisi"
              className="w-40"
            />
            <Select
              value={riskFilter}
              onChange={setRiskFilter}
              options={[
                { value: "ALL", label: "Semua Status" },
                { value: "CRITICAL", label: "Kritis (SP)" },
                { value: "WARNING", label: "Perhatian" },
                { value: "SAFE", label: "Aman" },
              ]}
              ariaLabel="Filter risiko"
              className="w-36"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Presensi Hadir</th>
                <th className={th}>Terlambat</th>
                <th className={th}>Menit Telat</th>
                <th className={th}>Alfa</th>
                <th className={th}>Tepat Waktu</th>
                <th className={th}>Status Tindakan</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {filteredRows.length === 0 && <Empty cols={8} text="Tidak ada data kedisiplinan yang cocok." />}
              {filteredRows.map((r) => (
                <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="py-3.5">
                    <div className="font-bold text-zinc-900">{r.user.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      {r.user.nik ? `${r.user.nik} • ` : ""}
                      {r.user.division}
                    </div>
                  </td>
                  <td className="py-3.5">{r.hadir} hari</td>
                  <td className="py-3.5">
                    {r.telat > 0 ? (
                      <span className="font-semibold text-rose-600">{r.telat}x</span>
                    ) : (
                      <span className="text-zinc-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5">{r.menitTelat > 0 ? `${r.menitTelat} mnt` : "-"}</td>
                  <td className="py-3.5">
                    {r.alfa > 0 ? (
                      <span className="font-bold text-rose-600">{r.alfa}x</span>
                    ) : (
                      <span className="text-zinc-400">0</span>
                    )}
                  </td>
                  <td className="py-3.5">
                    <Bar pct={r.pct} />
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`${pill} ${
                        r.risk === "CRITICAL"
                          ? "bg-rose-50 text-rose-600"
                          : r.risk === "WARNING"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {r.riskLabel}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => setSel(r)} className={linkBtn}>
                      Detail <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Karyawan & Riwayat */}
      {sel && (
        <Modal title="Detail Kedisiplinan Karyawan" onClose={() => setSel(null)}>
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-zinc-900">{sel.user.name}</div>
                  <div className="text-xs text-zinc-500">
                    {sel.user.nik || "Tanpa NIP"} • {sel.user.division} • {sel.user.jobPosition || "Staf"}
                  </div>
                </div>
                <span
                  className={`${pill} ${
                    sel.risk === "CRITICAL"
                      ? "bg-rose-50 text-rose-600"
                      : sel.risk === "WARNING"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {sel.riskLabel}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 border-t border-zinc-200/60 pt-3 text-center text-xs">
                <div>
                  <div className="text-[11px] text-zinc-400">Hadir</div>
                  <div className="font-bold text-zinc-800">{sel.hadir}</div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Terlambat</div>
                  <div className="font-bold text-rose-600">{sel.telat}x</div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Menit Telat</div>
                  <div className="font-bold text-zinc-800">{sel.menitTelat}m</div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Alfa</div>
                  <div className="font-bold text-rose-600">{sel.alfa}</div>
                </div>
              </div>
            </div>

            {/* Catatan Evaluasi HR (bila ada) */}
            {sel.user.hrEvalDiscipline && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                <div className="font-bold mb-1">Catatan Evaluasi HR:</div>
                <p>{sel.user.hrEvalDiscipline}</p>
              </div>
            )}

            <div>
              <div className="mb-2 text-xs font-bold text-zinc-900">
                Riwayat Presensi {month ? `(Bulan ${month})` : ""}
              </div>
              <ul className="max-h-60 space-y-2 overflow-y-auto">
                {attendances
                  .filter((a) => {
                    if (a.userId !== sel.user.id) return false;
                    if (month && a.date && !a.date.startsWith(month)) return false;
                    return true;
                  })
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-800">{a.date}</span>
                        <span className="ml-2 text-zinc-400">
                          {a.checkInTime ? `Masuk: ${a.checkInTime}` : "-"}
                          {a.checkOutTime && a.checkOutTime !== "-" ? ` • Pulang: ${a.checkOutTime}` : ""}
                        </span>
                      </div>
                      <AttBadge status={a.status} late={a.lateMinutes} />
                    </li>
                  ))}
                {sel.hadir === 0 && (
                  <li className="py-4 text-center text-xs text-zinc-400">
                    Tidak ada presensi tercatat di periode ini.
                  </li>
                )}
              </ul>
            </div>

            <button onClick={() => setSel(null)} className={`${btnDark} w-full justify-center py-2.5`}>
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
