"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Download, Edit3, RefreshCw } from "lucide-react";
import Modal from "@/components/Modal";
import { Empty, Kpi, PageHead, btnDark, card, input, linkBtn, pill, th, useGMData } from "@/components/gm-shared";
import { calculatePayroll } from "@/lib/payroll";

export const rp = (n: number) => `Rp ${Math.round(Number(n) || 0).toLocaleString("id-ID")}`;

export function useFinanceData() {
  const gm = useGMData();
  const [slips, setSlips] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const loadSlips = useCallback(async () => {
    try {
      const r = await fetch("/api/payroll/slip");
      const d: any = await r.json();
      setSlips(d.slips || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  const reloadAll = useCallback(async () => {
    await Promise.all([gm.reload(), loadSlips()]);
  }, [gm, loadSlips]);

  const generate = async (month: number, year: number) => {
    setBusy(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      const d: any = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menghitung payroll");
      await reloadAll();
      return d;
    } finally {
      setBusy(false);
    }
  };

  const employees = gm.users.filter((u) => u.role === "EMPLOYEE");

  const computed = employees.map((emp) => {
    const atts = gm.attendances.filter(
      (a) => a.userId === emp.id && (a.status === "TEPAT_WAKTU" || a.status === "TERLAMBAT")
    );
    const lateMinutes = atts.reduce((s, a) => s + (a.lateMinutes || 0), 0);
    const overtimeMinutes = atts.reduce((s, a) => s + (a.overtimeMinutes || 0), 0);
    const approvedLeaveDays = gm.leaves
      .filter((l) => l.userId === emp.id && l.status === "FINAL_DISETUJUI")
      .reduce((s, l) => s + (l.durationDays || 0), 0);
    const presentDays = atts.length;
    const absentDays = Math.max(0, 22 - (presentDays + approvedLeaveDays));
    const allowance = emp.allowance ?? 750000;
    const bonus = emp.bonus ?? 0;
    const calc = calculatePayroll({
      baseSalary: emp.baseSalary,
      allowance,
      totalLateMinutes: lateMinutes,
      totalAbsentDays: absentDays,
      totalOvertimeMinutes: overtimeMinutes,
      workingDaysInMonth: 22,
    });
    const bpjs = Math.round(emp.baseSalary * 0.02);
    const tax = calc.taxAndBpjs - bpjs;
    const netSalary = calc.netSalary + bonus;
    return {
      user: emp,
      presentDays,
      approvedLeaveDays,
      absentDays,
      lateMinutes,
      overtimeMinutes,
      bonus,
      bpjs,
      tax,
      ...calc,
      netSalary,
    };
  });

  return { ...gm, employees, computed, slips, busy, generate, reloadAll };
}

export function SlipModal({ slip, onClose }: { slip: any; onClose: () => void }) {
  const bpjs = slip.bpjsDeduction ?? Math.round((slip.baseSalary || 0) * 0.02);
  const tax = slip.taxDeduction ?? (slip.taxAndBpjs || 0) - bpjs;
  const bonus = slip.bonus ?? 0;

  return (
    <Modal title="Rincian Slip Gaji Karyawan" onClose={onClose}>
      <div className="space-y-4 text-xs">
        <div className="flex items-start justify-between rounded-2xl bg-zinc-50 p-4">
          <div>
            <div className="text-sm font-bold text-zinc-900">{slip.userName}</div>
            <div className="text-zinc-500">{slip.userNik} • Divisi {slip.userDivision}</div>
          </div>
          <span className={`${pill} bg-emerald-50 text-emerald-600`}>
            Periode {slip.month}/{slip.year} • {slip.status}
          </span>
        </div>

        <div className="space-y-2 rounded-2xl bg-zinc-50 p-4">
          <div className="font-bold text-zinc-900">Penerimaan (+)</div>
          <div className="flex justify-between text-zinc-600">
            <span>Gaji Pokok</span>
            <strong className="text-zinc-900">{rp(slip.baseSalary)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Tunjangan Operasional</span>
            <strong className="text-emerald-600">+{rp(slip.allowance)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Upah Lembur (PP 35/2021)</span>
            <strong className="text-emerald-600">+{rp(slip.overtimePay)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Bonus / Insentif</span>
            <strong className="text-emerald-600">+{rp(bonus)}</strong>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl bg-zinc-50 p-4">
          <div className="font-bold text-zinc-900">Potongan (-)</div>
          <div className="flex justify-between text-zinc-600">
            <span>Potongan Keterlambatan</span>
            <strong className="text-rose-600">-{rp(slip.lateDeduction)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Potongan Ketidakhadiran (Alfa)</span>
            <strong className="text-rose-600">-{rp(slip.absentDeduction)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Iuran BPJS Kesehatan & TK (2%)</span>
            <strong className="text-rose-600">-{rp(bpjs)}</strong>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Pajak PPh 21 (2%)</span>
            <strong className="text-rose-600">-{rp(tax)}</strong>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-zinc-950 p-4 text-white">
          <span className="font-semibold">Take Home Pay (Gaji Bersih)</span>
          <span className="text-base font-bold">{rp(slip.netSalary)}</span>
        </div>

        <button onClick={onClose} className={`${btnDark} w-full justify-center py-2.5`}>
          Tutup
        </button>
      </div>
    </Modal>
  );
}

export function FinanceSectionPage({
  mode,
}: {
  mode:
    | "perhitungan"
    | "gaji-pokok"
    | "tunjangan"
    | "potongan"
    | "lembur"
    | "bonus"
    | "bpjs"
    | "pajak"
    | "slip-gaji"
    | "rekap";
}) {
  const { computed, slips, busy, generate, reloadAll } = useFinanceData();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [q, setQ] = useState("");
  const [editRow, setEditRow] = useState<any | null>(null);
  const [editVal, setEditVal] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [slipSel, setSlipSel] = useState<any | null>(null);

  const term = q.trim().toLowerCase();
  const rows = computed.filter((r) =>
    `${r.user.name} ${r.user.nik} ${r.user.division}`.toLowerCase().includes(term)
  );
  const filteredSlips = slips.filter((s) =>
    `${s.userName} ${s.userNik} ${s.userDivision}`.toLowerCase().includes(term)
  );

  const sum = (fn: (r: any) => number) => rows.reduce((a, b) => a + fn(b), 0);

  const saveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRow) return;
    setSaving(true);
    try {
      const payload: any = { userId: editRow.user.id };
      if (mode === "gaji-pokok") payload.baseSalary = editVal;
      if (mode === "tunjangan") payload.allowance = editVal;
      if (mode === "bonus") payload.bonus = editVal;
      const res = await fetch("/api/master/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditRow(null);
        await reloadAll();
      }
    } finally {
      setSaving(false);
    }
  };

  const downloadCsv = () => {
    const head = [
      "NIK",
      "Nama",
      "Divisi",
      "Gaji Pokok",
      "Tunjangan",
      "Lembur",
      "Bonus",
      "Potongan Telat",
      "Potongan Alfa",
      "BPJS",
      "Pajak PPh21",
      "Gaji Bersih (THP)",
    ];
    const body = rows.map((r) =>
      [
        r.user.nik,
        r.user.name,
        r.user.division,
        r.baseSalary,
        r.allowance,
        r.overtimePay,
        r.bonus,
        r.lateDeduction,
        r.absentDeduction,
        r.bpjs,
        r.tax,
        r.netSalary,
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    );
    const url = URL.createObjectURL(new Blob([[head.join(","), ...body].join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-payroll-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const META: Record<string, { title: string; desc: string }> = {
    perhitungan: {
      title: "Perhitungan Payroll",
      desc: "Kalkulasi otomatis payroll bulanan dari data kehadiran dan cuti/izin yang telah tervalidasi HR.",
    },
    "gaji-pokok": {
      title: "Gaji Pokok",
      desc: "Manajemen gaji pokok bulanan dan tarif pro-rata harian/jam kerja karyawan.",
    },
    tunjangan: {
      title: "Tunjangan",
      desc: "Manajemen tunjangan tetap operasional dan jabatan karyawan.",
    },
    potongan: {
      title: "Potongan",
      desc: "Rincian potongan keterlambatan (Rp 1.000/menit) dan potongan ketidakhadiran/alfa dari data absensi.",
    },
    lembur: {
      title: "Lembur",
      desc: "Perhitungan upah lembur karyawan berdasarkan jam lembur tervalidasi sesuai PP 35/2021 (1.5x upah sejam).",
    },
    bonus: {
      title: "Bonus & Insentif",
      desc: "Manajemen bonus kinerja dan insentif tambahan karyawan.",
    },
    bpjs: {
      title: "BPJS Kesehatan & Ketenagakerjaan",
      desc: "Rincian pemotongan iuran wajib BPJS karyawan (2% dari gaji pokok).",
    },
    pajak: {
      title: "Pajak PPh 21",
      desc: "Perhitungan estimasi potongan pajak penghasilan PPh 21 karyawan (2% dari gaji pokok).",
    },
    "slip-gaji": {
      title: "Slip Gaji Karyawan",
      desc: "Daftar slip gaji resmi yang telah diterbitkan untuk karyawan.",
    },
    rekap: {
      title: "Rekap Payroll",
      desc: "Rekapitulasi menyeluruh anggaran penggajian, komponen penerimaan, potongan, dan unduh CSV.",
    },
  };

  const info = META[mode];

  return (
    <div className="flex flex-col gap-6">
      <PageHead title={info.title} desc={info.desc} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Total Karyawan" value={rows.length} icon={RefreshCw} />
        <Kpi label="Total Gaji Pokok" value={rp(sum((r) => r.baseSalary))} icon={RefreshCw} />
        <Kpi
          label={
            mode === "potongan"
              ? "Total Potongan Absensi"
              : mode === "bpjs"
              ? "Total Iuran BPJS"
              : mode === "pajak"
              ? "Total Pajak PPh 21"
              : mode === "lembur"
              ? "Total Upah Lembur"
              : mode === "bonus"
              ? "Total Bonus"
              : "Total Tunjangan & Bonus"
          }
          value={
            mode === "potongan"
              ? rp(sum((r) => r.lateDeduction + r.absentDeduction))
              : mode === "bpjs"
              ? rp(sum((r) => r.bpjs))
              : mode === "pajak"
              ? rp(sum((r) => r.tax))
              : mode === "lembur"
              ? rp(sum((r) => r.overtimePay))
              : mode === "bonus"
              ? rp(sum((r) => r.bonus))
              : rp(sum((r) => r.allowance + r.bonus))
          }
          icon={RefreshCw}
        />
        <Kpi label="Total Gaji Bersih (THP)" value={rp(sum((r) => r.netSalary))} icon={RefreshCw} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Daftar {info.title}</h2>
            <p className="text-xs text-zinc-500">Data tersinkronisasi dengan absensi & validasi akhir HR</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(mode === "perhitungan" || mode === "slip-gaji" || mode === "rekap") && (
              <>
                <select
                  aria-label="Bulan"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className={input}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Bulan {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  aria-label="Tahun"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`${input} w-24`}
                />
                <button
                  onClick={() => generate(month, year)}
                  disabled={busy}
                  className={btnDark}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                  {busy ? "Menghitung..." : "Hitung & Terbitkan Slip"}
                </button>
              </>
            )}
            {mode === "rekap" && (
              <button onClick={downloadCsv} disabled={!rows.length} className={btnDark}>
                <Download className="h-3.5 w-3.5" /> Unduh CSV
              </button>
            )}
            <input
              type="search"
              aria-label="Cari karyawan"
              placeholder="Cari nama, NIK..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${input} w-52`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {mode === "slip-gaji" ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Periode</th>
                  <th className={th}>Gaji Pokok</th>
                  <th className={th}>Tunjangan & Bonus</th>
                  <th className={th}>Potongan & Pajak</th>
                  <th className={th}>Take Home Pay</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {filteredSlips.length === 0 && (
                  <Empty cols={8} text="Belum ada slip gaji diterbitkan. Klik 'Hitung & Terbitkan Slip' di atas." />
                )}
                {filteredSlips.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{s.userName}</div>
                      <div className="text-[11px] text-zinc-400">{s.userNik} • {s.userDivision}</div>
                    </td>
                    <td className="py-3.5">{s.month}/{s.year}</td>
                    <td className="py-3.5">{rp(s.baseSalary)}</td>
                    <td className="py-3.5 text-emerald-600">
                      +{rp((s.allowance || 0) + (s.overtimePay || 0) + (s.bonus || 0))}
                    </td>
                    <td className="py-3.5 text-rose-600">
                      -{rp((s.lateDeduction || 0) + (s.absentDeduction || 0) + (s.taxAndBpjs || 0))}
                    </td>
                    <td className="py-3.5 font-bold text-zinc-900">{rp(s.netSalary)}</td>
                    <td className="py-3.5">
                      <span className={`${pill} bg-emerald-50 text-emerald-600`}>{s.status}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setSlipSel(s)} className={linkBtn}>
                        Lihat Slip <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Divisi & Jabatan</th>
                  {mode === "gaji-pokok" && (
                    <>
                      <th className={th}>Gaji Pokok</th>
                      <th className={th}>Tarif Harian (22 Hari)</th>
                      <th className={th}>Tarif per Jam (1/173)</th>
                      <th className={`${th} text-right`}>Aksi</th>
                    </>
                  )}
                  {mode === "tunjangan" && (
                    <>
                      <th className={th}>Gaji Pokok</th>
                      <th className={th}>Tunjangan Tetap</th>
                      <th className={th}>Total Gaji + Tunjangan</th>
                      <th className={`${th} text-right`}>Aksi</th>
                    </>
                  )}
                  {mode === "potongan" && (
                    <>
                      <th className={th}>Hadir / Cuti</th>
                      <th className={th}>Menit Terlambat</th>
                      <th className={th}>Potongan Telat</th>
                      <th className={th}>Hari Alfa & Potongan</th>
                      <th className={th}>Total Potongan</th>
                    </>
                  )}
                  {mode === "lembur" && (
                    <>
                      <th className={th}>Tarif per Jam</th>
                      <th className={th}>Durasi Lembur</th>
                      <th className={th}>Pengali PP 35/2021</th>
                      <th className={th}>Upah Lembur</th>
                    </>
                  )}
                  {mode === "bonus" && (
                    <>
                      <th className={th}>Skor Evaluasi HR</th>
                      <th className={th}>Gaji Pokok</th>
                      <th className={th}>Bonus / Insentif</th>
                      <th className={`${th} text-right`}>Aksi</th>
                    </>
                  )}
                  {mode === "bpjs" && (
                    <>
                      <th className={th}>Gaji Pokok Dasar</th>
                      <th className={th}>BPJS Kesehatan (1%)</th>
                      <th className={th}>BPJS Ketenagakerjaan (1%)</th>
                      <th className={th}>Total Potongan BPJS</th>
                    </>
                  )}
                  {mode === "pajak" && (
                    <>
                      <th className={th}>Penghasilan Bruto</th>
                      <th className={th}>Tarif Efektif PPh 21</th>
                      <th className={th}>Potongan Pajak PPh 21</th>
                    </>
                  )}
                  {(mode === "perhitungan" || mode === "rekap") && (
                    <>
                      <th className={th}>Gaji Pokok</th>
                      <th className={th}>Tunjangan & Bonus</th>
                      <th className={th}>Lembur</th>
                      <th className={th}>Potongan Telat/Alfa</th>
                      <th className={th}>BPJS & Pajak</th>
                      <th className={th}>Gaji Bersih (THP)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {rows.length === 0 && <Empty cols={8} text="Tidak ada data karyawan." />}
                {rows.map((r) => (
                  <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{r.user.name}</div>
                      <div className="text-[11px] text-zinc-400">{r.user.nik}</div>
                    </td>
                    <td className="py-3.5">
                      {r.user.division}
                      <div className="text-[11px] text-zinc-400">{r.user.jobPosition}</div>
                    </td>

                    {mode === "gaji-pokok" && (
                      <>
                        <td className="py-3.5 font-bold text-zinc-900">{rp(r.baseSalary)}</td>
                        <td className="py-3.5 text-zinc-500">{rp(r.baseSalary / 22)} / hari</td>
                        <td className="py-3.5 text-zinc-500">{rp(r.baseSalary / 173)} / jam</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setEditRow(r);
                              setEditVal(r.baseSalary);
                            }}
                            className={linkBtn}
                          >
                            <Edit3 className="h-3 w-3" /> Ubah Gaji
                          </button>
                        </td>
                      </>
                    )}

                    {mode === "tunjangan" && (
                      <>
                        <td className="py-3.5">{rp(r.baseSalary)}</td>
                        <td className="py-3.5 font-bold text-emerald-600">+{rp(r.allowance)}</td>
                        <td className="py-3.5 font-bold text-zinc-900">{rp(r.baseSalary + r.allowance)}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setEditRow(r);
                              setEditVal(r.allowance);
                            }}
                            className={linkBtn}
                          >
                            <Edit3 className="h-3 w-3" /> Ubah Tunjangan
                          </button>
                        </td>
                      </>
                    )}

                    {mode === "potongan" && (
                      <>
                        <td className="py-3.5">{r.presentDays} hadir • {r.approvedLeaveDays} cuti/izin</td>
                        <td className="py-3.5">{r.lateMinutes} menit</td>
                        <td className="py-3.5 text-rose-600">-{rp(r.lateDeduction)}</td>
                        <td className="py-3.5 text-rose-600">{r.absentDays} hari (-{rp(r.absentDeduction)})</td>
                        <td className="py-3.5 font-bold text-rose-600">
                          -{rp(r.lateDeduction + r.absentDeduction)}
                        </td>
                      </>
                    )}

                    {mode === "lembur" && (
                      <>
                        <td className="py-3.5 text-zinc-500">{rp(r.baseSalary / 173)}</td>
                        <td className="py-3.5">{r.overtimeMinutes} menit</td>
                        <td className="py-3.5">1.5x</td>
                        <td className="py-3.5 font-bold text-emerald-600">+{rp(r.overtimePay)}</td>
                      </>
                    )}

                    {mode === "bonus" && (
                      <>
                        <td className="py-3.5">
                          <span className={`${pill} bg-zinc-100 text-zinc-700`}>
                            Skor: {r.user.hrEvalScore ?? 85}/100
                          </span>
                        </td>
                        <td className="py-3.5">{rp(r.baseSalary)}</td>
                        <td className="py-3.5 font-bold text-emerald-600">+{rp(r.bonus)}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              setEditRow(r);
                              setEditVal(r.bonus);
                            }}
                            className={linkBtn}
                          >
                            <Edit3 className="h-3 w-3" /> Atur Bonus
                          </button>
                        </td>
                      </>
                    )}

                    {mode === "bpjs" && (
                      <>
                        <td className="py-3.5">{rp(r.baseSalary)}</td>
                        <td className="py-3.5 text-rose-600">-{rp(r.baseSalary * 0.01)}</td>
                        <td className="py-3.5 text-rose-600">-{rp(r.baseSalary * 0.01)}</td>
                        <td className="py-3.5 font-bold text-rose-600">-{rp(r.bpjs)}</td>
                      </>
                    )}

                    {mode === "pajak" && (
                      <>
                        <td className="py-3.5">{rp(r.baseSalary + r.allowance + r.overtimePay + r.bonus)}</td>
                        <td className="py-3.5">2% (TER PPh 21)</td>
                        <td className="py-3.5 font-bold text-rose-600">-{rp(r.tax)}</td>
                      </>
                    )}

                    {(mode === "perhitungan" || mode === "rekap") && (
                      <>
                        <td className="py-3.5">{rp(r.baseSalary)}</td>
                        <td className="py-3.5 text-emerald-600">+{rp(r.allowance + r.bonus)}</td>
                        <td className="py-3.5 text-emerald-600">+{rp(r.overtimePay)}</td>
                        <td className="py-3.5 text-rose-600">-{rp(r.lateDeduction + r.absentDeduction)}</td>
                        <td className="py-3.5 text-rose-600">-{rp(r.bpjs + r.tax)}</td>
                        <td className="py-3.5 font-bold text-zinc-900">{rp(r.netSalary)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editRow && (
        <Modal title={`Atur ${info.title}`} onClose={() => setEditRow(null)}>
          <form onSubmit={saveField} className="space-y-4 text-xs">
            <div className="rounded-2xl bg-zinc-50 p-3">
              <div className="text-sm font-bold text-zinc-900">{editRow.user.name}</div>
              <div className="text-zinc-500">{editRow.user.nik} • {editRow.user.division}</div>
            </div>
            <label className="block font-semibold text-zinc-600">
              Nominal {info.title} (Rp)
              <input
                type="number"
                min={0}
                step={50000}
                required
                value={editVal}
                onChange={(e) => setEditVal(Number(e.target.value))}
                className={`${input} mt-1 w-full py-2.5 text-sm font-bold`}
              />
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="flex-1 rounded-full border border-zinc-200 bg-white py-2.5 font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Batal
              </button>
              <button type="submit" disabled={saving} className={`${btnDark} flex-1 justify-center py-2.5`}>
                {saving ? "Menyimpan..." : "Simpan Nominal"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {slipSel && <SlipModal slip={slipSel} onClose={() => setSlipSel(null)} />}
    </div>
  );
}
