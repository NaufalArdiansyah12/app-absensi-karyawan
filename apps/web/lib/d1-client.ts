import fs from "fs";
import path from "path";
import os from "os";

const CLOUDFLARE_ACCOUNT_ID =
  process.env.CLOUDFLARE_ACCOUNT_ID || "bc9c6902e87ce88ddaf2da8011bf6664";
const CLOUDFLARE_DATABASE_ID =
  process.env.CLOUDFLARE_DATABASE_ID || "4ddce4c1-b41f-4733-8928-0e984f8d925d";

function getConfigPath(): string | null {
  const p = path.join(os.homedir(), ".wrangler", "config", "default.toml");
  return fs.existsSync(p) ? p : null;
}

function getApiToken(): string | null {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  if (process.env.CLOUDFLARE_D1_TOKEN) return process.env.CLOUDFLARE_D1_TOKEN;

  try {
    const configPath = getConfigPath();
    if (configPath) {
      const content = fs.readFileSync(configPath, "utf-8");
      const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (match) return match[1];
    }
  } catch (_) {}

  return null;
}

async function refreshWranglerToken(): Promise<string | null> {
  try {
    const configPath = getConfigPath();
    if (!configPath) return null;
    const content = fs.readFileSync(configPath, "utf-8");
    const refreshMatch = content.match(/refresh_token\s*=\s*"([^"]+)"/);
    if (!refreshMatch) return null;

    const res = await fetch("https://dash.cloudflare.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshMatch[1],
        client_id: "54d11594-84e4-41aa-b438-e81b8fa78ee7",
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (!data.access_token) return null;

    let updated = content.replace(
      /oauth_token\s*=\s*"[^"]+"/,
      `oauth_token = "${data.access_token}"`
    );
    if (data.refresh_token) {
      updated = updated.replace(
        /refresh_token\s*=\s*"[^"]+"/,
        `refresh_token = "${data.refresh_token}"`
      );
    }
    fs.writeFileSync(configPath, updated, "utf-8");
    return data.access_token;
  } catch (_) {
    return null;
  }
}

export async function executeD1Query(
  sql: string,
  params: any[] = []
): Promise<any[]> {
  try {
    let token = getApiToken();
    if (!token) {
      console.warn("[D1] Token Cloudflare tidak ditemukan, skip write D1.");
      return [];
    }

    const runFetch = (bearer: string) =>
      fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${bearer}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sql, params }),
        }
      );

    let res = await runFetch(token);
    if (res.status === 401) {
      const refreshed = await refreshWranglerToken();
      if (refreshed) {
        res = await runFetch(refreshed);
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("[D1 HTTP Error]", res.status, errText);
      return [];
    }

    const data = (await res.json()) as any;
    if (data.success && data.result?.[0]?.results) {
      return data.result[0].results;
    }
    return [];
  } catch (err) {
    console.warn("[D1 Sync Error]", err);
    return [];
  }
}

// Map user NIK ke id_karyawan di D1
const NIK_TO_KARYAWAN_ID: Record<string, number> = {
  SU001: 1,
  GM001: 2,
  HR001: 3,
  FN001: 4,
  EMP001: 5,
  EMP002: 6,
};

export function getKaryawanIdByNik(nik: string): number {
  return NIK_TO_KARYAWAN_ID[nik] || 5;
}

/**
 * Sinkronisasi Check-in ke tabel presensi di Cloudflare D1
 */
export async function syncCheckInToD1(params: {
  karyawanId: number;
  shiftId: number;
  tanggal: string;
  waktuMasuk: string;
  lintangMasuk: number;
  bujurMasuk: number;
  statusKehadiran: string;
}) {
  const sql = `
    INSERT INTO presensi (
      id_karyawan, id_shift, tanggal, waktu_masuk,
      lintang_masuk, bujur_masuk, status_kehadiran, dibuat_pada
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id_karyawan, tanggal) DO UPDATE SET
      waktu_masuk = excluded.waktu_masuk,
      lintang_masuk = excluded.lintang_masuk,
      bujur_masuk = excluded.bujur_masuk,
      status_kehadiran = excluded.status_kehadiran,
      diperbarui_pada = datetime('now');
  `;
  await executeD1Query(sql, [
    params.karyawanId,
    params.shiftId,
    params.tanggal,
    params.waktuMasuk,
    params.lintangMasuk,
    params.bujurMasuk,
    params.statusKehadiran,
  ]);
}

/**
 * Sinkronisasi Check-out ke tabel presensi di Cloudflare D1
 */
export async function syncCheckOutToD1(params: {
  karyawanId: number;
  tanggal: string;
  waktuPulang: string;
  lintangPulang: number;
  bujurPulang: number;
}) {
  const sql = `
    UPDATE presensi
    SET waktu_pulang = ?,
        lintang_pulang = ?,
        bujur_pulang = ?,
        diperbarui_pada = datetime('now')
    WHERE id_karyawan = ? AND tanggal = ?;
  `;
  await executeD1Query(sql, [
    params.waktuPulang,
    params.lintangPulang,
    params.bujurPulang,
    params.karyawanId,
    params.tanggal,
  ]);
}

/**
 * Sinkronisasi Pengajuan Cuti/Izin ke tabel pengajuan_cuti_izin di Cloudflare D1
 */
export async function syncLeaveApplyToD1(params: {
  karyawanId: number;
  jenisPengajuan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  statusPersetujuan?: string;
}) {
  const sql = `
    INSERT INTO pengajuan_cuti_izin (
      id_karyawan, jenis_pengajuan, tanggal_mulai, tanggal_selesai,
      alasan, status_persetujuan, dibuat_pada
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'));
  `;
  await executeD1Query(sql, [
    params.karyawanId,
    params.jenisPengajuan,
    params.tanggalMulai,
    params.tanggalSelesai,
    params.alasan,
    params.statusPersetujuan || "Menunggu Approval GM",
  ]);
}

/**
 * Sinkronisasi Approval GM ke tabel pengajuan_cuti_izin di Cloudflare D1
 */
export async function syncLeaveGmApprovalToD1(params: {
  karyawanId: number;
  tanggalMulai: string;
  approved: boolean;
  gmUserId: number;
  gmNote?: string;
}) {
  const sql = `
    UPDATE pengajuan_cuti_izin
    SET status_persetujuan = ?,
        disetujui_gm_oleh = ?,
        waktu_approval_gm = datetime('now'),
        catatan_penolakan = ?,
        diperbarui_pada = datetime('now')
    WHERE id_karyawan = ? AND tanggal_mulai = ?;
  `;
  await executeD1Query(sql, [
    params.approved ? "Menunggu Approval HR" : "Ditolak GM",
    params.gmUserId,
    params.gmNote || null,
    params.karyawanId,
    params.tanggalMulai,
  ]);
}

/**
 * Sinkronisasi Approval HR ke tabel pengajuan_cuti_izin di Cloudflare D1
 */
export async function syncLeaveHrApprovalToD1(params: {
  karyawanId: number;
  tanggalMulai: string;
  approved: boolean;
  hrUserId: number;
  hrNote?: string;
  updatedLeaveQuota?: number;
}) {
  const sql = `
    UPDATE pengajuan_cuti_izin
    SET status_persetujuan = ?,
        disetujui_hr_oleh = ?,
        waktu_approval_hr = datetime('now'),
        catatan_penolakan = ?,
        diperbarui_pada = datetime('now')
    WHERE id_karyawan = ? AND tanggal_mulai = ?;
  `;
  await executeD1Query(sql, [
    params.approved ? "Disetujui" : "Ditolak HR",
    params.hrUserId,
    params.hrNote || null,
    params.karyawanId,
    params.tanggalMulai,
  ]);
  if (params.approved && typeof params.updatedLeaveQuota === "number") {
    await executeD1Query(
      `UPDATE karyawan SET sisa_kuota_cuti = ?, diperbarui_pada = datetime('now') WHERE id = ?;`,
      [params.updatedLeaveQuota, params.karyawanId]
    );
  }
}

export function getShiftNumericId(shiftId?: string): number {
  const n = Number(String(shiftId || "shift_1").replace("shift_", ""));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function syncShiftToD1(shift: {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
}) {
  const numId = getShiftNumericId(shift.id);
  const fmt = (t: string, def: string) => {
    const v = t || def;
    return v.length === 5 ? `${v}:00` : v;
  };
  const start = fmt(shift.startTime, "08:00");
  const end = fmt(shift.endTime, "17:00");
  const bStart = fmt(shift.breakStartTime || "12:00", "12:00");
  const bEnd = fmt(shift.breakEndTime || "13:00", "13:00");
  await executeD1Query(
    `INSERT INTO shift_kerja (id, nama_shift, jam_masuk, jam_pulang, jam_istirahat_mulai, jam_istirahat_selesai, dibuat_pada, diperbarui_pada)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       nama_shift = excluded.nama_shift,
       jam_masuk = excluded.jam_masuk,
       jam_pulang = excluded.jam_pulang,
       jam_istirahat_mulai = excluded.jam_istirahat_mulai,
       jam_istirahat_selesai = excluded.jam_istirahat_selesai,
       diperbarui_pada = datetime('now');`,
    [numId, shift.name, start, end, bStart, bEnd]
  );
}

export async function syncUserShiftToD1(nik: string, shiftId: string) {
  const numShiftId = getShiftNumericId(shiftId);
  await executeD1Query(
    `UPDATE karyawan SET id_shift = ?, diperbarui_pada = datetime('now') WHERE nip = ?;`,
    [numShiftId, nik]
  );
}
