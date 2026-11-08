"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, MapPin, XCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { AttBadge, LeaveBadge, Select, btnDark, input, typeLabel } from "@/components/gm-shared";

export function LeaveModal({
  sel,
  onClose,
  onDone,
  tier = "GM",
}: {
  sel: any;
  onClose: () => void;
  onDone: () => void;
  tier?: "GM" | "HR";
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const isHR = tier === "HR";
  const canAct = isHR ? sel.status === "MENUNGGU_HR" : sel.status === "MENUNGGU_GM";

  const act = async (action: "APPROVE" | "REJECT") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/leaves/${sel.id}/${isHR ? "approve-hr" : "approve-gm"}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: note || (action === "APPROVE" ? (isHR ? "Disetujui Final oleh HR" : "Disetujui GM") : `Ditolak ${tier}`),
        }),
      });
      if (res.ok) {
        onClose();
        onDone();
      } else {
        alert(((await res.json()) as any).error || `Gagal memproses approval ${tier}`);
      }
    } catch (e: any) {
      alert(e.message || "Kesalahan jaringan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Approval Cuti / Izin" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-900">{sel.userName}</div>
            <div className="text-xs text-zinc-500">Divisi {sel.userDivision} • {typeLabel(sel.type)}</div>
          </div>
          <LeaveBadge status={sel.status} />
        </div>
        <div className="space-y-2 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            {sel.startDate} s/d {sel.endDate} ({sel.durationDays} hari)
          </div>
          <div>&ldquo;{sel.reason}&rdquo;</div>
          {sel.gmNote && <div className="text-xs text-zinc-500">Catatan GM: {sel.gmNote}</div>}
          {sel.hrNote && <div className="text-xs text-zinc-500">Catatan HR: {sel.hrNote}</div>}
        </div>
        {canAct ? (
          <>
            <label className="block text-xs font-semibold text-zinc-500">
              Catatan {tier} (opsional)
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={`${input} mt-1 w-full py-2.5 text-sm`} />
            </label>
            <div className="flex gap-2 pt-2">
              <button
                disabled={busy}
                onClick={() => act("REJECT")}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Tolak
              </button>
              <button disabled={busy} onClick={() => act("APPROVE")} className={`${btnDark} flex-1 justify-center py-2.5`}>
                <CheckCircle2 className="h-4 w-4" /> {isHR ? "Setujui Final" : "Setujui Tahap 1"}
              </button>
            </div>
          </>
        ) : (
          <button onClick={onClose} className={`${btnDark} w-full justify-center py-2.5`}>Tutup</button>
        )}
      </div>
    </Modal>
  );
}

export function AttModal({
  sel,
  onClose,
  onDone,
}: {
  sel: any;
  onClose: () => void;
  onDone?: () => void;
}) {
  const [fullPhoto, setFullPhoto] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(
    sel.status === "BELUM_ABSEN" ? "TEPAT_WAKTU" : sel.status
  );
  const [inTime, setInTime] = useState(
    sel.checkInTime && sel.checkInTime !== "-" ? sel.checkInTime.slice(0, 5) : "08:00"
  );
  const [outTime, setOutTime] = useState(
    sel.checkOutTime && sel.checkOutTime !== "-" ? sel.checkOutTime.slice(0, 5) : "17:00"
  );
  const [busy, setBusy] = useState(false);

  const isNonPhysical =
    sel.status === "CUTI" ||
    sel.status === "IZIN_SAKIT" ||
    sel.status === "IZIN" ||
    sel.status === "BELUM_ABSEN" ||
    sel.status === "ALFA";
  const editIsPresent = status === "TEPAT_WAKTU" || status === "TERLAMBAT";
  const fallback = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600";
  const photo = sel.checkInPhotoKey || fallback;

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/attendance/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sel.userId,
          date: sel.date,
          status,
          checkInTime: editIsPresent && inTime ? `${inTime}:00` : "-",
          checkOutTime: editIsPresent && outTime ? `${outTime}:00` : "-",
        }),
      });
      if (res.ok) {
        onDone?.();
        onClose();
      } else {
        alert(((await res.json()) as any).error || "Gagal menyimpan koreksi absensi");
      }
    } catch (e: any) {
      alert(e.message || "Kesalahan jaringan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Detail & Kelola Kehadiran" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold text-zinc-900">{sel.userName}</div>
            <div className="text-xs text-zinc-500">{sel.date}</div>
          </div>
          <AttBadge status={sel.status} late={sel.lateMinutes} />
        </div>
        {!isNonPhysical && (
          <div className="relative">
            <img
              src={photo}
              alt="Bukti Swafoto"
              className={`${fullPhoto ? "max-h-[70vh] object-contain bg-zinc-950" : "max-h-48 object-cover"} w-full rounded-2xl`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallback;
              }}
            />
            <button
              type="button"
              onClick={() => setFullPhoto((v) => !v)}
              className="absolute right-2.5 bottom-2.5 rounded-full bg-zinc-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-zinc-950"
            >
              {fullPhoto ? "Kecilkan Foto" : "Lihat Foto Penuh"}
            </button>
          </div>
        )}
        <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4">
          {[
            ["Shift Kerja", sel.shiftName || "Shift Reguler (08:00-17:00)"],
            ["Jarak ke Kantor", isNonPhysical ? "-" : `${sel.checkInDistanceMeters} m`],
            ["Jam Masuk", sel.checkInTime || "-"],
            ["Jam Pulang", sel.checkOutTime || "-"],
            ["Keterlambatan", `${sel.lateMinutes || 0} menit`],
            ["Lembur", `${sel.overtimeMinutes || 0} menit`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] text-zinc-400">{k}</dt>
              <dd className="font-bold text-zinc-900">{v}</dd>
            </div>
          ))}
        </dl>
        {!isNonPhysical && sel.checkInLat != null && sel.checkInLng != null && (() => {
          const lat = Number(sel.checkInLat);
          const lng = Number(sel.checkInLng);
          const d = 0.003;
          const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-zinc-900 underline"
                >
                  Buka Peta
                </a>
              </div>
              <iframe
                title="Lokasi Kehadiran"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                scrolling="no"
                className="h-44 w-full overflow-hidden rounded-2xl border border-zinc-200"
                loading="lazy"
              />
            </div>
          );
        })()}
        {editing ? (
          <div className="space-y-3 rounded-2xl border border-zinc-200 p-4">
            <div className="text-xs font-bold text-zinc-900">Koreksi / Input Manual Absensi</div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-500">Status Kehadiran</div>
              <Select
                ariaLabel="Status Kehadiran"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "TEPAT_WAKTU", label: "Tepat Waktu" },
                  { value: "TERLAMBAT", label: "Terlambat" },
                  { value: "CUTI", label: "Cuti" },
                  { value: "IZIN_SAKIT", label: "Izin Sakit" },
                  { value: "IZIN", label: "Izin" },
                  { value: "ALFA", label: "Alfa" },
                ]}
              />
            </div>
            {editIsPresent && (
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-zinc-500">
                  Jam Masuk
                  <input
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className={`${input} mt-1 w-full py-2 text-xs`}
                  />
                </label>
                <label className="block text-xs font-semibold text-zinc-500">
                  Jam Pulang
                  <input
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className={`${input} mt-1 w-full py-2 text-xs`}
                  />
                </label>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-full border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={save}
                className={`${btnDark} flex-1 justify-center py-2`}
              >
                Simpan Koreksi
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-1 rounded-full border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Koreksi Absensi
            </button>
            <button onClick={onClose} className={`${btnDark} flex-1 justify-center py-2.5`}>
              Tutup
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
