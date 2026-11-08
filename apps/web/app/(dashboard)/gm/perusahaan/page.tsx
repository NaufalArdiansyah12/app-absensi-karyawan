"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, CalendarCheck, ChevronRight, Clock, UserCheck, Users } from "lucide-react";
import {
  Bar, CalendarWidget, Empty, Kpi, PageHead, card, linkBtn, th, useGMData,
} from "@/components/gm-shared";

export default function CompanyPage() {
  const { users, leaves, attendances } = useGMData();
  const isHR = usePathname().startsWith("/hr");
  const tier = isHR ? "HR" : "GM";
  const prefix = isHR ? "/hr" : "/gm";
  const waitStatus = isHR ? "MENUNGGU_HR" : "MENUNGGU_GM";
  const today = new Date().toISOString().split("T")[0];
  const staff = users.filter((u) => u.role === "EMPLOYEE");
  const todayAtt = attendances.filter((a) => a.date === today);
  const onLeave = leaves.filter((l) => l.status === "FINAL_DISETUJUI" && l.startDate <= today && today <= l.endDate);
  const pending = leaves.filter((l) => l.status === waitStatus);
  const pendingCuti = pending.filter((l) => l.type === "CUTI_TAHUNAN").length;
  const lateToday = todayAtt.filter((a) => a.status === "TERLAMBAT").length;

  const divisions = [...new Set(staff.map((u) => u.division))].map((d) => {
    const ids = staff.filter((u) => u.division === d).map((u) => u.id);
    const rows = attendances.filter((a) => ids.includes(a.userId));
    const tepat = rows.filter((a) => a.status === "TEPAT_WAKTU").length;
    return {
      d,
      total: ids.length,
      hadir: todayAtt.filter((a) => ids.includes(a.userId)).length,
      pct: rows.length ? Math.round((tepat / rows.length) * 100) : 0,
      pending: pending.filter((l) => ids.includes(l.userId)).length,
    };
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="flex flex-col gap-6 xl:col-span-8">
        <PageHead title="Kondisi Perusahaan" desc="Ringkasan kondisi operasional perusahaan hari ini." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Total Karyawan" value={staff.length} icon={Users} />
          <Kpi label="Hadir Hari Ini" value={todayAtt.length} icon={UserCheck} />
          <Kpi label="Sedang Cuti/Izin" value={onLeave.length} icon={CalendarCheck} />
          <Kpi label="Menunggu Approval" value={pending.length} icon={Clock} />
        </div>

        <div className={`${card} flex flex-col gap-5`}>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Ringkasan per Divisi</h2>
            <p className="text-xs text-zinc-500">Kehadiran hari ini dan tingkat ketepatan waktu</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400">
                  <th className={th}>Divisi</th>
                  <th className={th}>Karyawan</th>
                  <th className={th}>Hadir Hari Ini</th>
                  <th className={th}>Tepat Waktu</th>
                  <th className={th}>Menunggu Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
                {divisions.length === 0 && <Empty cols={5} text="Belum ada data karyawan." />}
                {divisions.map((r) => (
                  <tr key={r.d} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5 font-bold text-zinc-900">{r.d}</td>
                    <td className="py-3.5">{r.total}</td>
                    <td className="py-3.5">{r.hadir}/{r.total}</td>
                    <td className="py-3.5"><Bar pct={r.pct} /></td>
                    <td className="py-3.5">{r.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:col-span-4">
        <CalendarWidget />
        <div className={`${card} flex flex-col gap-3`}>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Perlu Perhatian</h2>
            <p className="text-xs text-zinc-500">Tindakan yang menunggu {tier}</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/90 p-4 text-xs">
            <span className="font-semibold text-zinc-700">Approval cuti</span>
            <Link href={`${prefix}/cuti`} className={linkBtn}>{pendingCuti} menunggu <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/90 p-4 text-xs">
            <span className="font-semibold text-zinc-700">Approval izin</span>
            <Link href={`${prefix}/izin`} className={linkBtn}>{pending.length - pendingCuti} menunggu <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/90 p-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
              <AlertTriangle className="h-3.5 w-3.5" /> Terlambat hari ini
            </span>
            <Link href={`${prefix}/kedisiplinan`} className={linkBtn}>{lateToday} karyawan <ChevronRight className="h-3 w-3" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
