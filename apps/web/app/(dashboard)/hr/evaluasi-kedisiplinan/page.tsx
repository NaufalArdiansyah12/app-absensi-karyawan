"use client";

import { useState } from "react";
import { AlertTriangle, Award, CheckCircle2, ChevronRight, Gauge } from "lucide-react";
import Modal from "@/components/Modal";
import {
  Bar, Empty, Kpi, PageHead, btnDark, card, discipline, input, linkBtn, pill, th, useGMData,
} from "@/components/gm-shared";

function getGrade(telat: number, pct: number, hadAttendance: boolean): [string, string] {
  if (!hadAttendance) return ["Baik (A)", "bg-emerald-50 text-emerald-600"];
  if (telat === 0 && pct >= 95) return ["Sangat Disiplin (A)", "bg-emerald-50 text-emerald-600"];
  if (telat <= 2 && pct >= 80) return ["Disiplin (B)", "bg-blue-50 text-blue-600"];
  if (telat <= 4) return ["Perlu Pembinaan (C)", "bg-amber-50 text-amber-600"];
  return ["Teguran / SP (D)", "bg-rose-50 text-rose-600"];
}

export default function EvalDisciplinePage() {
  const { users, attendances, reload } = useGMData();
  const [sel, setSel] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = discipline(users, attendances).map((r) => {
    const [grade, cls] = getGrade(r.telat, r.pct, r.hadir > 0);
    return { ...r, grade, cls };
  });

  const good = rows.filter((r) => r.grade.includes("(A)") || r.grade.includes("(B)")).length;
  const warn = rows.length - good;
  const withData = rows.filter((r) => r.hadir > 0);
  const avg = withData.length ? Math.round(withData.reduce((s, r) => s + r.pct, 0) / withData.length) : 100;

  const openEval = (r: any) => {
    setSel(r);
    setNote(r.user.hrEvalDiscipline || "");
  };

  const saveEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    setBusy(true);
    try {
      const res = await fetch("/api/master/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: sel.user.id, hrEvalDiscipline: note }),
      });
      if (res.ok) {
        setSel(null);
        reload();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Evaluasi Kedisiplinan" desc="Penilaian tingkat kedisiplinan jam kerja dan catatan pembinaan HR." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Rata-rata Disiplin" value={`${avg}%`} icon={Gauge} />
        <Kpi label="Predikat Baik (A/B)" value={good} icon={CheckCircle2} />
        <Kpi label="Perlu Pembinaan" value={warn} icon={AlertTriangle} />
        <Kpi label="Sudah Dievaluasi" value={rows.filter((r) => r.user.hrEvalDiscipline).length} icon={Award} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Daftar Evaluasi Kedisiplinan Karyawan</h2>
          <p className="text-xs text-zinc-500">Klik Evaluasi untuk memberikan catatan pembinaan atau apresiasi HR</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Hadir</th>
                <th className={th}>Terlambat</th>
                <th className={th}>Ketepatan</th>
                <th className={th}>Predikat</th>
                <th className={th}>Catatan Evaluasi HR</th>
                <th className={`${th} text-right`}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-medium text-zinc-800">
              {rows.length === 0 && <Empty cols={7} text="Belum ada data karyawan." />}
              {rows.map((r) => (
                <tr key={r.user.id} className="transition-colors hover:bg-zinc-50/50">
                  <td className="py-3.5">
                    <div className="font-bold text-zinc-900">{r.user.name}</div>
                    <div className="text-[11px] text-zinc-400">{r.user.division} • {r.user.jobPosition}</div>
                  </td>
                  <td className="py-3.5">{r.hadir} hari</td>
                  <td className="py-3.5">{r.telat}x ({r.menitTelat} mnt)</td>
                  <td className="py-3.5"><Bar pct={r.hadir ? r.pct : 100} /></td>
                  <td className="py-3.5"><span className={`${pill} ${r.cls}`}>{r.grade}</span></td>
                  <td className="py-3.5 text-zinc-500">{r.user.hrEvalDiscipline || "Belum ada catatan"}</td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => openEval(r)} className={linkBtn}>
                      Evaluasi <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <Modal title="Evaluasi Kedisiplinan Karyawan" onClose={() => setSel(null)}>
          <form onSubmit={saveEval} className="space-y-4 text-xs">
            <div className="flex items-start justify-between rounded-2xl bg-zinc-50 p-3">
              <div>
                <div className="text-sm font-bold text-zinc-900">{sel.user.name}</div>
                <div className="text-zinc-500">{sel.user.nik} • {sel.user.division}</div>
              </div>
              <span className={`${pill} ${sel.cls}`}>{sel.grade}</span>
            </div>
            <dl className="grid grid-cols-3 gap-3 rounded-2xl bg-zinc-50 p-3 text-center">
              <div>
                <dt className="text-[11px] text-zinc-400">Hadir</dt>
                <dd className="text-sm font-bold text-zinc-900">{sel.hadir} hari</dd>
              </div>
              <div>
                <dt className="text-[11px] text-zinc-400">Terlambat</dt>
                <dd className="text-sm font-bold text-zinc-900">{sel.telat}x</dd>
              </div>
              <div>
                <dt className="text-[11px] text-zinc-400">Total Menit Telat</dt>
                <dd className="text-sm font-bold text-zinc-900">{sel.menitTelat} mnt</dd>
              </div>
            </dl>
            <label className="block font-semibold text-zinc-600">
              Catatan Evaluasi / Pembinaan Kedisiplinan HR
              <input
                type="text"
                placeholder="Contoh: Pertahankan ketepatan waktu / Teguran lisan keterlambatan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${input} mt-1 w-full py-2.5 text-sm`}
              />
            </label>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setSel(null)} className="flex-1 rounded-full border border-zinc-200 bg-white py-2.5 font-semibold text-zinc-700 hover:bg-zinc-50">
                Batal
              </button>
              <button type="submit" disabled={busy} className={`${btnDark} flex-1 justify-center py-2.5`}>
                {busy ? "Menyimpan..." : "Simpan Evaluasi"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
