"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight, DollarSign, MinusCircle, Receipt, RefreshCw, Users, Wallet } from "lucide-react";
import { CalendarWidget, Empty, Kpi, PageHead, btnDark, card, linkBtn, pill, th } from "@/components/gm-shared";
import { SlipModal, rp, useFinanceData } from "@/components/finance-shared";

export default function FinanceDashboardPage() {
  const { computed, slips, busy, generate } = useFinanceData();
  const [slipSel, setSlipSel] = useState<any | null>(null);
  const now = new Date();

  const totalBase = computed.reduce((s, r) => s + r.baseSalary, 0);
  const totalAdd = computed.reduce((s, r) => s + r.allowance + r.overtimePay + r.bonus, 0);
  const totalDed = computed.reduce((s, r) => s + r.lateDeduction + r.absentDeduction + r.taxAndBpjs, 0);
  const totalNet = computed.reduce((s, r) => s + r.netSalary, 0);
  const gross = totalBase + totalAdd;
  const netPct = gross ? Math.round((totalNet / gross) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="flex flex-col gap-6 xl:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageHead
            title="Dashboard Finance"
            desc="Ringkasan penggajian, komponen penerimaan/potongan, dan penerbitan slip gaji dari data absensi & HR."
          />
          <button
            onClick={() => generate(now.getMonth() + 1, now.getFullYear())}
            disabled={busy}
            className={btnDark}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
            {busy ? "Menghitung..." : "Generate Payroll Bulan Ini"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Karyawan Aktif" value={computed.length} icon={Users} />
          <Kpi label="Total Gaji Pokok" value={rp(totalBase)} icon={Wallet} />
          <Kpi label="Total Potongan & Pajak" value={rp(totalDed)} icon={MinusCircle} />
          <Kpi label="Total Take Home Pay" value={rp(totalNet)} icon={DollarSign} />
        </div>

        <div className={`${card} flex flex-col gap-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Estimasi Perhitungan Payroll Aktif</h2>
              <p className="text-xs text-zinc-500">Berdasarkan kehadiran GPS & cuti/izin yang telah disetujui final oleh HR</p>
            </div>
            <Link href="/finance/perhitungan" className={linkBtn}>
              Kelola payroll <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Gaji Pokok</th>
                  <th className={th}>Tunjangan & Bonus</th>
                  <th className={th}>Potongan & Pajak</th>
                  <th className={th}>Gaji Bersih (THP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {computed.length === 0 && <Empty cols={5} text="Belum ada data karyawan." />}
                {computed.map((r) => (
                  <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{r.user.name}</div>
                      <div className="text-[11px] text-zinc-400">{r.user.nik} • {r.user.division}</div>
                    </td>
                    <td className="py-3.5">{rp(r.baseSalary)}</td>
                    <td className="py-3.5 text-emerald-600">+{rp(r.allowance + r.overtimePay + r.bonus)}</td>
                    <td className="py-3.5 text-rose-600">-{rp(r.lateDeduction + r.absentDeduction + r.taxAndBpjs)}</td>
                    <td className="py-3.5 font-bold text-zinc-900">{rp(r.netSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${card} flex flex-col gap-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Slip Gaji Terbaru</h2>
              <p className="text-xs text-zinc-500">{slips.length} slip gaji telah diterbitkan</p>
            </div>
            <Link href="/finance/slip-gaji" className={linkBtn}>
              Semua slip <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Karyawan</th>
                  <th className={th}>Periode</th>
                  <th className={th}>Gaji Bersih</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {slips.length === 0 && <Empty cols={5} text="Belum ada slip gaji diterbitkan." />}
                {slips.slice(0, 6).map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{s.userName}</div>
                      <div className="text-[11px] text-zinc-400">{s.userDivision}</div>
                    </td>
                    <td className="py-3.5">{s.month}/{s.year}</td>
                    <td className="py-3.5 font-bold text-zinc-900">{rp(s.netSalary)}</td>
                    <td className="py-3.5">
                      <span className={`${pill} bg-emerald-50 text-emerald-600`}>{s.status}</span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setSlipSel(s)} className={linkBtn}>
                        <Receipt className="h-3 w-3" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:col-span-4">
        <CalendarWidget />
        <div className={`${card} flex flex-col gap-4`}>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Rasio Anggaran Gaji</h2>
            <p className="text-xs text-zinc-500">Proporsi Take Home Pay terhadap Bruto</p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white/90 p-5 shadow-sm">
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-zinc-700">
                <span>Rasio Gaji Bersih</span>
                <span>{netPct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-900" style={{ width: `${netPct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-2 text-center">
              {[
                ["Slip", slips.length],
                ["Karyawan", computed.length],
                ["Potongan", computed.filter((r) => r.lateDeduction > 0).length],
              ].map(([label, v]) => (
                <div key={label as string}>
                  <div className="text-base font-bold text-zinc-900">{String(v).padStart(2, "0")}</div>
                  <div className="text-[10px] font-medium text-zinc-400">{label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white py-2.5 text-center text-xs font-bold text-zinc-900">
              Alur: Absensi <ArrowRight className="mx-1 inline h-3 w-3" /> HR <ArrowRight className="mx-1 inline h-3 w-3" /> Finance
            </div>
          </div>
        </div>
      </div>

      {slipSel && <SlipModal slip={slipSel} onClose={() => setSlipSel(null)} />}
    </div>
  );
}
