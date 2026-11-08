"use client";

import { useState } from "react";
import { Award, CalendarCheck, ChevronRight, TrendingUp, UserCheck } from "lucide-react";
import Modal from "@/components/Modal";
import {
  Bar, Empty, Kpi, PageHead, btnDark, card, discipline, input, isCuti, linkBtn, pill, th, useGMData,
} from "@/components/gm-shared";

export default function EvalPerformancePage() {
  const { users, leaves, attendances, reload } = useGMData();
  const [sel, setSel] = useState<any | null>(null);
  const [score, setScore] = useState<number>(85);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const approved = leaves.filter((l) => l.status === "FINAL_DISETUJUI");
  const rows = discipline(users, attendances).map((s) => {
    const mine = approved.filter((l) => l.userId === s.user.id);
    const cuti = mine.filter((l) => isCuti(l)).reduce((n, l) => n + (l.durationDays || 0), 0);
    const izin = mine.filter((l) => !isCuti(l)).reduce((n, l) => n + (l.durationDays || 0), 0);
    const defaultScore = s.hadir ? Math.max(60, Math.min(100, s.pct - izin * 2)) : 85;
    const finalScore = s.user.hrEvalScore ?? defaultScore;
    const [label, cls] =
      finalScore >= 85
        ? ["Sangat Baik", "bg-emerald-50 text-emerald-600"]
        : finalScore >= 70
        ? ["Optimal", "bg-blue-50 text-blue-600"]
        : ["Perlu Peningkatan", "bg-amber-50 text-amber-600"];
    return { ...s, cuti, izin, finalScore, label, cls };
  });

  const avgScore = rows.length ? Math.round(rows.reduce((a, b) => a + b.finalScore, 0) / rows.length) : 0;

  const openModal = (r: any) => {
    setSel(r);
    setScore(r.finalScore);
    setNote(r.user.hrEvalPerformance || "");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    setBusy(true);
    try {
      const res = await fetch("/api/master/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sel.user.id,
          hrEvalScore: score,
          hrEvalPerformance: note,
        }),
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
      <PageHead title="Evaluasi Kinerja & Kehadiran" desc="Penilaian performa kehadiran, pemanfaatan cuti/izin, dan skor kinerja HR." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Rata-rata Skor Kinerja" value={`${avgScore}/100`} icon={TrendingUp} />
        <Kpi label="Performa Sangat Baik" value={rows.filter((r) => r.finalScore >= 85).length} icon={Award} />
        <Kpi label="Total Hari Hadir" value={rows.reduce((a, b) => a + b.hadir, 0)} icon={UserCheck} />
        <Kpi label="Total Cuti & Izin" value={rows.reduce((a, b) => a + b.cuti + b.izin, 0)} icon={CalendarCheck} />
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Matriks Evaluasi Kinerja & Kehadiran</h2>
          <p className="text-xs text-zinc-500">Evaluasi gabungan kehadiran aktif, rasio izin, dan penilaian akhir HR</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-400">
                <th className={th}>Karyawan</th>
                <th className={th}>Hadir</th>
                <th className={th}>Cuti / Izin</th>
                <th className={th}>Skor Kinerja</th>
                <th className={th}>Status Kinerja</th>
                <th className={th}>Catatan HR</th>
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
                  <td className="py-3.5">{r.cuti} cuti • {r.izin} izin</td>
                  <td className="py-3.5"><Bar pct={r.finalScore} /></td>
                  <td className="py-3.5"><span className={`${pill} ${r.cls}`}>{r.label}</span></td>
                  <td className="py-3.5 text-zinc-500">{r.user.hrEvalPerformance || "Belum ada catatan"}</td>
                  <td className="py-3.5 text-right">
                    <button onClick={() => openModal(r)} className={linkBtn}>
                      Nilai <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <Modal title="Evaluasi Kinerja & Kehadiran" onClose={() => setSel(null)}>
          <form onSubmit={save} className="space-y-4 text-xs">
            <div className="flex items-start justify-between rounded-2xl bg-zinc-50 p-3">
              <div>
                <div className="text-sm font-bold text-zinc-900">{sel.user.name}</div>
                <div className="text-zinc-500">{sel.user.nik} • {sel.user.division}</div>
              </div>
              <span className={`${pill} ${sel.cls}`}>{sel.label}</span>
            </div>
            <label className="block font-semibold text-zinc-600">
              Skor Kinerja & Kehadiran (0 - 100)
              <input
                type="number"
                min={0}
                max={100}
                required
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className={`${input} mt-1 w-full py-2.5 text-sm font-bold`}
              />
            </label>
            <label className="block font-semibold text-zinc-600">
              Rekomendasi / Catatan Evaluasi Kinerja HR
              <input
                type="text"
                placeholder="Contoh: Kehadiran konsisten dan kontribusi kerja sangat baik..."
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
                {busy ? "Menyimpan..." : "Simpan Penilaian"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
