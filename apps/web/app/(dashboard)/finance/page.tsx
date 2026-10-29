"use client";

import { useEffect, useState } from "react";
import { DollarSign, FileText, CheckCircle, RefreshCw, Download } from "lucide-react";

export default function FinanceDashboardPage() {
  const [slips, setSlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const loadSlips = async () => {
    try {
      const res = await fetch("/api/payroll/slip");
      const data: any = await res.json();
      if (data.slips) setSlips(data.slips);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlips();
  }, []);

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      const data: any = await res.json();
      if (res.ok) {
        alert(data.message || "Payroll berhasil dihitung");
        await loadSlips();
      } else {
        alert(data.error || "Gagal mengkalkulasi payroll");
      }
    } catch (e: any) {
      alert(e.message || "Kesalahan jaringan");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Modul Penggajian & Payroll (Finance)</h1>
        <p className="text-xs text-slate-500">
          Sinkronisasi data kehadiran tervalidasi dari HR, kalkulasi gaji bersih, potongan keterlambatan/alfa, dan penerbitan slip gaji.
        </p>
      </div>

      {/* Control Panel Kalkulasi Payroll */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Kalkulasi Otomatis Payroll Bulanan</h2>
            <p className="text-[11px] text-slate-500">
              Sistem akan menghitung otomatis hari hadir, jam lembur, potongan telat, dan iuran BPJS/pajak.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-emerald-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Bulan {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-emerald-500"
              />
            </div>

            <button
              onClick={handleGeneratePayroll}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
              <span>{generating ? "Mengkalkulasi..." : "Generate & Terbitkan Slip"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Rincian Slip Gaji Karyawan */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Rekapitulasi Slip Gaji Karyawan (Periode Aktif)
            </h2>
          </div>
          <span className="text-xs text-slate-500">{slips.length} Slip Diterbitkan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Karyawan</th>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Gaji Pokok</th>
                <th className="py-2.5 px-3">Tunjangan</th>
                <th className="py-2.5 px-3">Potongan Telat</th>
                <th className="py-2.5 px-3">Potongan Alfa</th>
                <th className="py-2.5 px-3">Upah Lembur</th>
                <th className="py-2.5 px-3">BPJS & Pajak</th>
                <th className="py-2.5 px-3 font-bold text-emerald-700">Gaji Bersih (THP)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {slips.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 font-sans">
                  <td className="py-2 px-3">
                    <div className="font-semibold text-slate-900">{s.userName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {s.userNik} • {s.userDivision}
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono">
                    {s.month}/{s.year}
                  </td>
                  <td className="py-2 px-3 font-mono">
                    Rp {Number(s.baseSalary).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-mono text-emerald-600">
                    +Rp {Number(s.allowance).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-mono text-rose-600">
                    -Rp {Number(s.lateDeduction).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-mono text-rose-600">
                    -Rp {Number(s.absentDeduction).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-mono text-emerald-600">
                    +Rp {Number(s.overtimePay).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-500">
                    -Rp {Number(s.taxAndBpjs).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                    Rp {Number(s.netSalary).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-3">
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
