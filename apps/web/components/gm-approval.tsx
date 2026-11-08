"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Clock, XCircle, FileText } from "lucide-react";
import { LeaveModal } from "@/components/gm-modals";
import {
  Bar, Empty, Kpi, LeaveBadge, PageHead, Select, card, isCuti, linkBtn, th, typeLabel, useGMData,
} from "@/components/gm-shared";

export default function ApprovalPage({
  kind = "all",
  tier = "GM",
}: {
  kind?: "cuti" | "izin" | "all";
  tier?: "GM" | "HR";
}) {
  const { leaves, reload } = useGMData();
  const [filter, setFilter] = useState("ALL");
  const [sel, setSel] = useState<any | null>(null);
  const isHR = tier === "HR";
  const waitStatus = isHR ? "MENUNGGU_HR" : "MENUNGGU_GM";

  const label = kind === "cuti" ? "Cuti" : kind === "izin" ? "Izin" : "Cuti & Izin";
  const list = leaves
    .filter((l) => (kind === "all" ? true : kind === "cuti" ? isCuti(l) : !isCuti(l)))
    .sort((a, b) => Number(b.status === waitStatus) - Number(a.status === waitStatus) || b.createdAt - a.createdAt);
  const shown = filter === "ALL" ? list : list.filter((l) => l.status === filter);
  const count = (s: string) => list.filter((l) => l.status === s).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title={kind === "all" ? "Approve Tahap Akhir Cuti & Izin" : isHR ? `Monitoring & Approval ${label}` : `Approval ${label}`}
        desc={
          isHR
            ? `Monitoring dan persetujuan tahap akhir (Final Tier) pengajuan ${label.toLowerCase()}. Persetujuan cuti tahunan memotong kuota.`
            : `Persetujuan Tahap 1 pengajuan ${kind}. Yang disetujui diteruskan ke HR.`
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Menunggu GM" value={count("MENUNGGU_GM")} icon={Clock} />
        <Kpi label={isHR ? "Menunggu HR" : "Diteruskan ke HR"} value={count("MENUNGGU_HR")} icon={FileText} />
        <Kpi label="Disetujui Final" value={count("FINAL_DISETUJUI")} icon={CheckCircle2} />
        <Kpi label="Ditolak" value={count("DITOLAK_GM") + count("DITOLAK_HR")} icon={XCircle} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Daftar Pengajuan {label}</h2>
            <p className="text-xs text-zinc-500">{shown.length} pengajuan</p>
          </div>
          <Select
            ariaLabel="Filter status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "ALL", label: "Semua status" },
              { value: "MENUNGGU_GM", label: "Menunggu GM" },
              { value: "MENUNGGU_HR", label: "Menunggu HR" },
              { value: "FINAL_DISETUJUI", label: "Disetujui" },
              { value: "DITOLAK_GM", label: "Ditolak GM" },
              { value: "DITOLAK_HR", label: "Ditolak HR" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Jenis</th>
                <th className={th}>Periode</th>
                <th className={th}>Progres</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {shown.length === 0 && <Empty cols={6} text={`Tidak ada pengajuan ${label.toLowerCase()}.`} />}
              {shown.map((l) => {
                const pending = l.status === waitStatus;
                const step = l.status === "MENUNGGU_GM" ? 0 : l.status === "DITOLAK_GM" ? 0 : l.status === "MENUNGGU_HR" ? 50 : 100;
                return (
                  <tr key={l.id} className="transition-colors hover:bg-zinc-50/50">
                    <td className="py-3.5">
                      <div className="font-bold text-zinc-900">{l.userName}</div>
                      <div className="text-[11px] text-zinc-400">{l.userDivision}</div>
                    </td>
                    <td className="py-3.5">{typeLabel(l.type)}</td>
                    <td className="py-3.5 text-zinc-500">
                      {l.startDate} s/d {l.endDate}
                      <div className="text-[11px] text-zinc-400">{l.durationDays} hari</div>
                    </td>
                    <td className="py-3.5"><Bar pct={step} /></td>
                    <td className="py-3.5"><LeaveBadge status={l.status} /></td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => setSel(l)} className={linkBtn}>
                        {pending ? "Proses" : "Detail"} <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sel && <LeaveModal key={sel.id} sel={sel} tier={tier} onClose={() => setSel(null)} onDone={reload} />}
    </div>
  );
}
