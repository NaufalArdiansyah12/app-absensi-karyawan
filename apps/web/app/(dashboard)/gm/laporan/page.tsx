"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, CalendarCheck, CheckCircle2, ChevronRight, Download, Users,
} from "lucide-react";
import Modal from "@/components/Modal";
import {
  AttBadge, DatePicker, Empty, Kpi, LeaveBadge, MonthPicker, PageHead, Select, btnDark, card, input, isCuti, linkBtn, pill, th, useGMData,
} from "@/components/gm-shared";

type PeriodMode = "WEEKLY" | "MONTHLY" | "YEARLY";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getMonday(d: Date): string {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  return dt.toISOString().split("T")[0];
}

function addDays(iso: string, days: number): string {
  const dt = new Date(`${iso}T00:00:00`);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split("T")[0];
}

function overlapDays(startA: string, endA: string, startB: string, endB: string): number {
  const s = startA > startB ? startA : startB;
  const e = endA < endB ? endA : endB;
  if (s > e) return 0;
  const diff = (new Date(`${e}T00:00:00`).getTime() - new Date(`${s}T00:00:00`).getTime()) / 86400000;
  return Math.floor(diff) + 1;
}

function summarize(atts: any[], leaves: any[], rangeStart: string, rangeEnd: string) {
  const hadir = atts.length;
  const tepat = atts.filter((a) => a.status === "TEPAT_WAKTU").length;
  const telat = hadir - tepat;
  const menitTelat = atts.reduce((n, a) => n + (a.lateMinutes || 0), 0);
  const menitLembur = atts.reduce((n, a) => n + (a.overtimeMinutes || 0), 0);
  const pct = hadir ? Math.round((tepat / hadir) * 100) : 100;

  const approved = leaves.filter((l) => l.status === "FINAL_DISETUJUI");
  const cuti = approved
    .filter((l) => isCuti(l))
    .reduce((n, l) => n + overlapDays(l.startDate, l.endDate, rangeStart, rangeEnd), 0);
  const izin = approved
    .filter((l) => !isCuti(l))
    .reduce((n, l) => n + overlapDays(l.startDate, l.endDate, rangeStart, rangeEnd), 0);

  return { hadir, tepat, telat, menitTelat, menitLembur, pct, cuti, izin };
}

function EmployeeRecapView({
  user,
  shift,
  mode,
  rangeStart,
  rangeEnd,
  year,
  month,
  userAtts,
  userLeaves,
}: {
  user: any;
  shift: any;
  mode: PeriodMode;
  rangeStart: string;
  rangeEnd: string;
  year: string;
  month: string;
  userAtts: any[];
  userLeaves: any[];
}) {
  const buckets = useMemo(() => {
    if (mode === "WEEKLY") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(rangeStart, i);
        const dt = new Date(`${d}T00:00:00`);
        const label = dt.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "short" });
        const a = userAtts.filter((x) => x.date === d);
        const l = userLeaves.filter((x) => x.startDate <= d && d <= x.endDate);
        return { label, ...summarize(a, l, d, d) };
      });
    }
    if (mode === "MONTHLY") {
      const [y, m] = month.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const weeks: { label: string; start: string; end: string }[] = [];
      for (let d = 1, w = 1; d <= lastDay; d += 7, w++) {
        const endD = Math.min(lastDay, d + 6);
        const s = `${month}-${String(d).padStart(2, "0")}`;
        const e = `${month}-${String(endD).padStart(2, "0")}`;
        weeks.push({ label: `Minggu ${w} (${String(d).padStart(2, "0")}–${String(endD).padStart(2, "0")})`, start: s, end: e });
      }
      return weeks.map((wk) => {
        const a = userAtts.filter((x) => wk.start <= x.date && x.date <= wk.end);
        const l = userLeaves.filter((x) => x.endDate >= wk.start && x.startDate <= wk.end);
        return { label: wk.label, ...summarize(a, l, wk.start, wk.end) };
      });
    }
    return MONTHS_ID.map((mName, idx) => {
      const mm = String(idx + 1).padStart(2, "0");
      const lastDay = new Date(Number(year), idx + 1, 0).getDate();
      const s = `${year}-${mm}-01`;
      const e = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
      const a = userAtts.filter((x) => s <= x.date && x.date <= e);
      const l = userLeaves.filter((x) => x.endDate >= s && x.startDate <= e);
      return { label: `${mName} ${year}`, ...summarize(a, l, s, e) };
    });
  }, [mode, rangeStart, month, year, userAtts, userLeaves]);

  const total = summarize(userAtts, userLeaves, rangeStart, rangeEnd);

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-zinc-50 p-4">
        <div>
          <div className="text-sm font-bold text-zinc-900">{user.name}</div>
          <div className="text-zinc-500">{user.nik} • {user.division} ({user.jobPosition})</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-zinc-900">{shift.name} ({shift.startTime}-{shift.endTime} WIB)</div>
          <div className="text-zinc-500">Istirahat {shift.breakStartTime || "12:00"}-{shift.breakEndTime || "13:00"} WIB</div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-6">
        {[
          ["Total Hadir", `${total.hadir} hari`],
          ["Tepat Waktu", `${total.tepat}x (${total.pct}%)`],
          ["Terlambat", `${total.telat}x (${total.menitTelat} mnt)`],
          ["Total Lembur", `${total.menitLembur} mnt`],
          ["Hari Cuti", `${total.cuti} hari`],
          ["Hari Izin", `${total.izin} hari`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] text-zinc-400">{k}</dt>
            <dd className="text-xs font-bold text-zinc-900">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-2xl border border-zinc-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/70 text-zinc-400">
              <th className={`${th} px-3`}>Periode Rincian</th>
              <th className={th}>Hadir</th>
              <th className={th}>Tepat Waktu</th>
              <th className={th}>Terlambat</th>
              <th className={th}>Menit Telat</th>
              <th className={th}>Lembur (mnt)</th>
              <th className={th}>Cuti</th>
              <th className={`${th} pr-3`}>Izin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
            {buckets.map((b) => (
              <tr key={b.label} className="hover:bg-zinc-50/50">
                <td className="px-3 py-2.5 font-bold text-zinc-900">{b.label}</td>
                <td className="py-2.5">{b.hadir}</td>
                <td className="py-2.5 text-emerald-600">{b.tepat}</td>
                <td className="py-2.5 text-rose-600">{b.telat}</td>
                <td className="py-2.5">{b.menitTelat} mnt</td>
                <td className="py-2.5">{b.menitLembur} mnt</td>
                <td className="py-2.5">{b.cuti} hr</td>
                <td className="py-2.5 pr-3">{b.izin} hr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="font-bold text-zinc-900">Log Presensi Periode Ini ({userAtts.length})</div>
          {userAtts.length === 0 ? (
            <div className="rounded-2xl bg-zinc-50 p-3 text-center text-zinc-400">Tidak ada presensi pada periode ini.</div>
          ) : (
            <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {userAtts.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
                  <div>
                    <span className="font-bold text-zinc-900">{a.date}</span>
                    <span className="ml-2 text-zinc-500">
                      Masuk {a.checkInTime} • Pulang {a.checkOutTime || "—"}
                    </span>
                  </div>
                  <AttBadge status={a.status} late={a.lateMinutes} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="font-bold text-zinc-900">Riwayat Cuti & Izin Periode Ini ({userLeaves.length})</div>
          {userLeaves.length === 0 ? (
            <div className="rounded-2xl bg-zinc-50 p-3 text-center text-zinc-400">Tidak ada cuti/izin pada periode ini.</div>
          ) : (
            <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {userLeaves.map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
                  <div>
                    <span className="font-bold text-zinc-900">{l.startDate} s/d {l.endDate}</span>
                    <span className="ml-2 text-zinc-500">({l.type === "CUTI_TAHUNAN" ? "Cuti" : "Izin"})</span>
                  </div>
                  <LeaveBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { users, leaves, attendances, shifts } = useGMData();
  const now = new Date();
  const [mode, setMode] = useState<PeriodMode>("MONTHLY");
  const [weekStart, setWeekStart] = useState<string>(() => getMonday(now));
  const [month, setMonth] = useState<string>(() => now.toISOString().slice(0, 7));
  const [year, setYear] = useState<string>(() => String(now.getFullYear()));
  const [userId, setUserId] = useState<string>("ALL");
  const [q, setQ] = useState<string>("");
  const [detailRow, setDetailRow] = useState<any | null>(null);

  const [rangeStart, rangeEnd, periodLabel] = useMemo(() => {
    if (mode === "WEEKLY") {
      const end = addDays(weekStart, 6);
      return [weekStart, end, `Mingguan (${weekStart} s/d ${end})`];
    }
    if (mode === "MONTHLY") {
      const [y, m] = month.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      return [`${month}-01`, `${month}-${String(lastDay).padStart(2, "0")}`, `Bulanan (${month})`];
    }
    return [`${year}-01-01`, `${year}-12-31`, `Tahunan (${year})`];
  }, [mode, weekStart, month, year]);

  const getShift = (u: any) =>
    shifts.find((s) => s.id === (u.shiftId || "shift_1")) ||
    shifts[0] || {
      id: "shift_1",
      name: "Shift Reguler",
      startTime: "08:00",
      endTime: "17:00",
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    };

  const periodAtts = useMemo(
    () => attendances.filter((a) => a.date && rangeStart <= a.date && a.date <= rangeEnd),
    [attendances, rangeStart, rangeEnd]
  );

  const periodLeaves = useMemo(
    () => leaves.filter((l) => l.endDate >= rangeStart && l.startDate <= rangeEnd),
    [leaves, rangeStart, rangeEnd]
  );

  const allRows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users
      .filter((u) => `${u.name} ${u.nik} ${u.division}`.toLowerCase().includes(term))
      .map((u) => {
        const uAtts = periodAtts.filter((a) => a.userId === u.id).sort((a, b) => b.date.localeCompare(a.date));
        const uLeaves = periodLeaves.filter((l) => l.userId === u.id);
        return {
          user: u,
          shift: getShift(u),
          uAtts,
          uLeaves,
          ...summarize(uAtts, uLeaves, rangeStart, rangeEnd),
        };
      });
  }, [users, periodAtts, periodLeaves, rangeStart, rangeEnd, q, shifts]);

  const visibleRows = userId === "ALL" ? allRows : allRows.filter((r) => r.user.id === userId);
  const selectedSingle = userId !== "ALL" ? allRows.find((r) => r.user.id === userId) : null;

  const kpi = useMemo(() => {
    const hadir = visibleRows.reduce((n, r) => n + r.hadir, 0);
    const tepat = visibleRows.reduce((n, r) => n + r.tepat, 0);
    const telat = visibleRows.reduce((n, r) => n + r.telat, 0);
    const mntTelat = visibleRows.reduce((n, r) => n + r.menitTelat, 0);
    const cutiIzin = visibleRows.reduce((n, r) => n + r.cuti + r.izin, 0);
    const pct = hadir ? Math.round((tepat / hadir) * 100) : 100;
    return { hadir, tepat, telat, mntTelat, cutiIzin, pct };
  }, [visibleRows]);

  const downloadCsv = () => {
    const head = [
      "Periode", "NIK", "Nama", "Divisi", "Shift", "Hadir", "Tepat Waktu",
      "Terlambat", "Menit Terlambat", "Menit Lembur", "Hari Cuti", "Hari Izin", "Disiplin (%)",
    ];
    const body = visibleRows.map((r) =>
      [
        periodLabel,
        r.user.nik,
        r.user.name,
        r.user.division,
        `${r.shift.name} (${r.shift.startTime}-${r.shift.endTime})`,
        r.hadir,
        r.tepat,
        r.telat,
        r.menitTelat,
        r.menitLembur,
        r.cuti,
        r.izin,
        `${r.pct}%`,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    );
    const url = URL.createObjectURL(new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-absensi-${mode.toLowerCase()}-${rangeStart}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title="Laporan & Rekap Absensi"
        desc="Rekapitulasi kehadiran, jam kerja, keterlambatan, cuti, dan izin (Mingguan, Bulanan, Tahunan)."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Total Kehadiran" value={`${kpi.hadir} hari`} icon={Users} />
        <Kpi label="Tepat Waktu" value={`${kpi.tepat}x (${kpi.pct}%)`} icon={CheckCircle2} />
        <Kpi label="Terlambat" value={`${kpi.telat}x (${kpi.mntTelat}m)`} icon={AlertTriangle} />
        <Kpi label="Total Cuti & Izin" value={`${kpi.cutiIzin} hari`} icon={CalendarCheck} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih periode rekap">
            {([
              ["WEEKLY", "Mingguan"],
              ["MONTHLY", "Bulanan"],
              ["YEARLY", "Tahunan"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                aria-pressed={mode === k}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  mode === k
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-black/5 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {mode === "WEEKLY" && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span>Mulai Minggu:</span>
                <DatePicker
                  ariaLabel="Tanggal mulai minggu"
                  value={weekStart}
                  onChange={setWeekStart}
                  clearable={false}
                />
              </div>
            )}
            {mode === "MONTHLY" && (
              <MonthPicker
                ariaLabel="Pilih bulan"
                value={month}
                onChange={setMonth}
              />
            )}
            {mode === "YEARLY" && (
              <Select
                ariaLabel="Pilih tahun"
                value={year}
                onChange={setYear}
                options={[2024, 2025, 2026, 2027].map((yr) => ({
                  value: String(yr),
                  label: `Tahun ${yr}`,
                }))}
              />
            )}

            <Select
              ariaLabel="Pilih cakupan karyawan"
              value={userId}
              onChange={setUserId}
              options={[
                { value: "ALL", label: `Semua Karyawan (${users.length})` },
                ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.nik})` })),
              ]}
            />

            {userId === "ALL" && (
              <input
                type="search"
                aria-label="Cari karyawan"
                placeholder="Cari nama/NIK..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={`${input} w-44`}
              />
            )}

            <button onClick={downloadCsv} disabled={!visibleRows.length} className={btnDark}>
              <Download className="h-3.5 w-3.5" /> Unduh CSV
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              {selectedSingle ? `Rekap Individu: ${selectedSingle.user.name}` : "Tabel Rekap Seluruh Karyawan"}
            </h2>
            <p className="text-xs text-zinc-500">
              Periode {periodLabel} • Cuti & izin dihitung yang berstatus Final Disetujui
            </p>
          </div>
          {selectedSingle && (
            <button onClick={() => setUserId("ALL")} className={linkBtn}>
              Lihat Semua Karyawan
            </button>
          )}
        </div>

        {selectedSingle ? (
          <EmployeeRecapView
            user={selectedSingle.user}
            shift={selectedSingle.shift}
            mode={mode}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            year={year}
            month={month}
            userAtts={selectedSingle.uAtts}
            userLeaves={selectedSingle.uLeaves}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Shift Kerja</th>
                  <th className={th}>Hadir</th>
                  <th className={th}>Tepat Waktu</th>
                  <th className={th}>Terlambat</th>
                  <th className={th}>Lembur</th>
                  <th className={th}>Hari Cuti</th>
                  <th className={th}>Hari Izin</th>
                  <th className={th}>Disiplin</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {visibleRows.length === 0 && <Empty cols={10} text="Data karyawan tidak ditemukan." />}
                {visibleRows.map((r) => (
                  <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{r.user.name}</div>
                      <div className="text-[11px] text-zinc-400">{r.user.nik} • {r.user.division}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{r.shift.name}</div>
                      <div className="text-[11px] text-zinc-500">{r.shift.startTime}-{r.shift.endTime} WIB</div>
                    </td>
                    <td className="py-3.5 font-bold">{r.hadir} hr</td>
                    <td className="py-3.5 text-emerald-600">{r.tepat}x</td>
                    <td className="py-3.5 text-rose-600">
                      {r.telat}x <span className="text-[11px] text-zinc-400">({r.menitTelat}m)</span>
                    </td>
                    <td className="py-3.5">{r.menitLembur} mnt</td>
                    <td className="py-3.5">{r.cuti} hr</td>
                    <td className="py-3.5">{r.izin} hr</td>
                    <td className="py-3.5">
                      <span
                        className={`${pill} ${
                          r.pct >= 80
                            ? "bg-emerald-50 text-emerald-600"
                            : r.pct >= 60
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {r.pct}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setDetailRow(r)} className={linkBtn}>
                        Rincian <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailRow && (
        <Modal wide title={`Rekap Absensi • ${periodLabel}`} onClose={() => setDetailRow(null)}>
          <div className="space-y-4">
            <EmployeeRecapView
              user={detailRow.user}
              shift={detailRow.shift}
              mode={mode}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              year={year}
              month={month}
              userAtts={detailRow.uAtts}
              userLeaves={detailRow.uLeaves}
            />
            <button onClick={() => setDetailRow(null)} className={`${btnDark} w-full justify-center py-2.5`}>
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
