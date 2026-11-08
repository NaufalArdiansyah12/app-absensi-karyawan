import { hashPassword } from "./auth-jwt.ts";

export interface UserItem {
  id: string;
  nik: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_USER" | "GM" | "HR" | "FINANCE" | "EMPLOYEE";
  division: string;
  jobPosition: string;
  shiftId?: string;
  baseSalary: number;
  allowance?: number;
  bonus?: number;
  leaveQuota: number;
  isVerified?: boolean;
  hrEvalDiscipline?: string;
  hrEvalPerformance?: string;
  hrEvalScore?: number;
  createdAt: number;
}

export interface OfficeLocationItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface ShiftItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  lateToleranceMinutes: number;
}

export interface AttendanceItem {
  id: string;
  userId: string;
  userName?: string;
  shiftId?: string;
  shiftName?: string;
  date: string;
  checkInTime: string;
  checkInLat: number;
  checkInLng: number;
  checkInDistanceMeters: number;
  checkInPhotoKey: string;
  checkOutTime?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  checkOutPhotoKey?: string;
  status: "TEPAT_WAKTU" | "TERLAMBAT" | "CUTI" | "IZIN_SAKIT" | "IZIN" | "ALFA" | "BELUM_ABSEN";
  lateMinutes: number;
  overtimeMinutes: number;
  createdAt: number;
}

export interface LeaveRequestItem {
  id: string;
  userId: string;
  userName?: string;
  userDivision?: string;
  type: "CUTI_TAHUNAN" | "IZIN_SAKIT" | "LAINNYA";
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  docKey?: string;
  status: "MENUNGGU_GM" | "DITOLAK_GM" | "MENUNGGU_HR" | "DITOLAK_HR" | "FINAL_DISETUJUI";
  gmNote?: string;
  gmApprovedAt?: number;
  hrNote?: string;
  hrApprovedAt?: number;
  createdAt: number;
}

export interface PayrollItem {
  id: string;
  userId: string;
  userName?: string;
  userNik?: string;
  userDivision?: string;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  bonus?: number;
  lateDeduction: number;
  absentDeduction: number;
  overtimePay: number;
  bpjsDeduction?: number;
  taxDeduction?: number;
  taxAndBpjs: number;
  netSalary: number;
  status: "DRAFT" | "PUBLISHED";
  generatedAt: number;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  details: string;
  createdAt: number;
}

// Global in-memory singleton untuk runtime development
class HRISDataStore {
  users: UserItem[] = [];
  offices: OfficeLocationItem[] = [];
  shifts: ShiftItem[] = [];
  attendances: AttendanceItem[] = [];
  leaves: LeaveRequestItem[] = [];
  payrolls: PayrollItem[] = [];
  auditLogs: AuditLogItem[] = [];
  private initialized = false;
  private d1Synced = false;
  private activeQuotaYear = new Date().getFullYear();

  // ponytail: in-memory annual quota reset; move to D1 cron/scheduled worker when multi-instance
  private resetAnnualQuotaIfNeeded() {
    const yearNow = new Date().getFullYear();
    if (this.activeQuotaYear !== yearNow) {
      this.activeQuotaYear = yearNow;
      for (const u of this.users) {
        u.leaveQuota = u.nik === "EMP002" ? 10 : 12;
      }
    }
  }

  // ponytail: in-memory shift-time check on read/approve; move to cron worker when multi-instance
  syncApprovedLeaveAttendances() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const leave of this.leaves) {
      if (leave.status !== "FINAL_DISETUJUI") continue;
      const emp = this.users.find((u) => u.id === leave.userId);
      if (!emp) continue;

      const shift =
        this.shifts.find((s) => s.id === (emp.shiftId || "shift_1")) ||
        this.shifts[0] || { id: "shift_1", name: "Shift Reguler", startTime: "08:00", endTime: "17:00" };
      const [sh, sm] = shift.startTime.split(":").map(Number);
      const shiftStartMinutes = (sh || 8) * 60 + (sm || 0);

      const attStatus: AttendanceItem["status"] =
        leave.type === "CUTI_TAHUNAN" ? "CUTI" : leave.type === "IZIN_SAKIT" ? "IZIN_SAKIT" : "IZIN";

      const cur = new Date(`${leave.startDate}T00:00:00`);
      const end = new Date(`${leave.endDate}T00:00:00`);

      while (cur <= end) {
        const dStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        // Hanya catat otomatis jika tanggal sudah lewat, atau hari ini dan sudah masuk jam shift karyawan
        if (dStr < todayStr || (dStr === todayStr && nowMinutes >= shiftStartMinutes)) {
          if (!this.attendances.some((a) => a.userId === emp.id && a.date === dStr)) {
            this.attendances.unshift({
              id: `att_leave_${leave.id}_${dStr}`,
              userId: emp.id,
              userName: emp.name,
              shiftId: shift.id,
              shiftName: `${shift.name} (${shift.startTime}-${shift.endTime})`,
              date: dStr,
              checkInTime: "-",
              checkInLat: 0,
              checkInLng: 0,
              checkInDistanceMeters: 0,
              checkInPhotoKey: "",
              checkOutTime: "-",
              status: attStatus,
              lateMinutes: 0,
              overtimeMinutes: 0,
              createdAt: new Date(`${dStr}T${shift.startTime}:00`).getTime() || Date.now(),
            });
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
  }

  async syncFromD1() {
    try {
      const { executeD1Query } = await import("./d1-client");
      const d1Shifts = await executeD1Query(`SELECT * FROM shift_kerja ORDER BY id ASC`);
      if (d1Shifts && d1Shifts.length > 0) {
        for (const s of d1Shifts) {
          const sid = `shift_${s.id}`;
          const start = String(s.jam_masuk || "08:00").slice(0, 5);
          const end = String(s.jam_pulang || "17:00").slice(0, 5);
          const bStart = String(s.jam_istirahat_mulai || "12:00").slice(0, 5);
          const bEnd = String(s.jam_istirahat_selesai || "13:00").slice(0, 5);
          const existing = this.shifts.find((x) => x.id === sid);
          if (existing) {
            existing.name = s.nama_shift;
            existing.startTime = start;
            existing.endTime = end;
            existing.breakStartTime = bStart;
            existing.breakEndTime = bEnd;
          } else {
            this.shifts.push({
              id: sid,
              name: s.nama_shift,
              startTime: start,
              endTime: end,
              breakStartTime: bStart,
              breakEndTime: bEnd,
              lateToleranceMinutes: 15,
            });
          }
        }
      }

      const d1Karyawan = await executeD1Query(`SELECT nip, id_shift FROM karyawan`);
      if (d1Karyawan && d1Karyawan.length > 0) {
        for (const k of d1Karyawan) {
          const u = this.users.find((x) => x.nik === k.nip);
          if (u && k.id_shift) u.shiftId = `shift_${k.id_shift}`;
        }
      }

      const d1Presensi = await executeD1Query(`
        SELECT p.*, k.nama_lengkap as karyawan_nama, k.nip as karyawan_nip
        FROM presensi p
        JOIN karyawan k ON p.id_karyawan = k.id
        ORDER BY p.tanggal DESC, p.waktu_masuk DESC
      `);
      if (d1Presensi && d1Presensi.length > 0) {
        this.d1Synced = true;
        for (const row of d1Presensi) {
          const userObj =
            this.users.find((u) => u.nik === row.karyawan_nip) ||
            this.users.find((u) => u.nik === "EMP001")!;
          if (
            !this.attendances.some(
              (a) => a.date === row.tanggal && a.userId === userObj.id
            )
          ) {
            this.attendances.push({
              id: `att_${row.id}`,
              userId: userObj.id,
              userName: row.karyawan_nama,
              date: row.tanggal,
              checkInTime: row.waktu_masuk || "-",
              checkInLat: row.lintang_masuk ?? -6.175392,
              checkInLng: row.bujur_masuk ?? 106.827153,
              checkInDistanceMeters: 0,
              checkInPhotoKey: "",
              checkOutTime: row.waktu_pulang || "-",
              checkOutLat: row.lintang_pulang || undefined,
              checkOutLng: row.bujur_pulang || undefined,
              status:
                row.status_kehadiran === "TERLAMBAT"
                  ? "TERLAMBAT"
                  : row.status_kehadiran === "CUTI"
                  ? "CUTI"
                  : row.status_kehadiran === "IZIN_SAKIT"
                  ? "IZIN_SAKIT"
                  : row.status_kehadiran === "IZIN"
                  ? "IZIN"
                  : row.status_kehadiran === "ALFA"
                  ? "ALFA"
                  : "TEPAT_WAKTU",
              lateMinutes: row.status_kehadiran === "TERLAMBAT" ? 30 : 0,
              overtimeMinutes: 0,
              createdAt: Date.now(),
            });
          }
        }
      }

      const d1Leaves = await executeD1Query(`
        SELECT c.*, k.nama_lengkap as karyawan_nama, k.nip as karyawan_nip, d.nama_divisi
        FROM pengajuan_cuti_izin c
        JOIN karyawan k ON c.id_karyawan = k.id
        LEFT JOIN divisi d ON k.id_divisi = d.id
        ORDER BY c.dibuat_pada DESC
      `);
      if (d1Leaves && d1Leaves.length > 0) {
        this.d1Synced = true;
        this.leaves = [];
        for (const row of d1Leaves) {
          const userObj =
            this.users.find((u) => u.nik === row.karyawan_nip) ||
            this.users.find((u) => u.nik === "EMP001")!;
          let status = "MENUNGGU_GM";
          if (row.status_persetujuan === "Menunggu Approval HR")
            status = "MENUNGGU_HR";
          else if (row.status_persetujuan === "Disetujui")
            status = "FINAL_DISETUJUI";
          else if (row.status_persetujuan === "Ditolak GM")
            status = "DITOLAK_GM";
          else if (row.status_persetujuan === "Ditolak HR")
            status = "DITOLAK_HR";

          const durationDays = Math.max(
            1,
            Math.round(
              (new Date(row.tanggal_selesai).getTime() -
                new Date(row.tanggal_mulai).getTime()) /
                86400000
            ) + 1
          );

          this.leaves.push({
            id: `leave_${row.id}`,
            userId: userObj.id,
            userName: row.karyawan_nama,
            userDivision: row.nama_divisi || "OPERASIONAL",
            type: row.jenis_pengajuan as any,
            startDate: row.tanggal_mulai,
            endDate: row.tanggal_selesai,
            durationDays,
            reason: row.alasan,
            status: status as any,
            gmNote: row.catatan_penolakan || undefined,
            createdAt: Date.now(),
          });

          if (
            status === "FINAL_DISETUJUI" &&
            row.jenis_pengajuan === "CUTI_TAHUNAN" &&
            String(row.tanggal_mulai).startsWith(`${this.activeQuotaYear}-`)
          ) {
            userObj.leaveQuota = Math.max(0, userObj.leaveQuota - durationDays);
          }
        }
      }
    } catch (_) {}
  }

  async init() {
    if (this.initialized) {
      this.resetAnnualQuotaIfNeeded();
      if (!this.d1Synced || this.attendances.length === 0) {
        await this.syncFromD1();
      }
      this.syncApprovedLeaveAttendances();
      return;
    }

    const defaultPassAdmin = await hashPassword("admin123");
    const defaultPassEmp = await hashPassword("karyawan123");

    this.users = [
      {
        id: "usr_su_1",
        nik: "SU001",
        name: "Admin Super User",
        email: "superuser@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "SUPER_USER",
        division: "IT",
        jobPosition: "System Administrator",
        baseSalary: 12000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_gm_1",
        nik: "GM001",
        name: "Budi Santoso (GM)",
        email: "gm@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "GM",
        division: "OPERASIONAL",
        jobPosition: "General Manager",
        baseSalary: 15000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_hr_1",
        nik: "HR001",
        name: "Siti Rahma (HR)",
        email: "hr@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "HR",
        division: "HR",
        jobPosition: "HR Specialist",
        baseSalary: 8000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_fin_1",
        nik: "FN001",
        name: "Dewi Lestari (Finance)",
        email: "finance@nutrilife.com",
        passwordHash: defaultPassAdmin,
        role: "FINANCE",
        division: "FINANCE",
        jobPosition: "Finance Officer",
        baseSalary: 8500000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_emp_1",
        nik: "EMP001",
        name: "Ahmad Fauzi",
        email: "karyawan@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "OPERASIONAL",
        jobPosition: "Staff Operasional",
        baseSalary: 6000000,
        leaveQuota: 12,
        createdAt: Date.now(),
      },
      {
        id: "usr_emp_2",
        nik: "EMP002",
        name: "Rian Pratama",
        email: "rian@nutrilife.com",
        passwordHash: defaultPassEmp,
        role: "EMPLOYEE",
        division: "OPERASIONAL",
        jobPosition: "Staff Gudang",
        baseSalary: 5500000,
        leaveQuota: 10,
        createdAt: Date.now(),
      },
    ];

    this.offices = [
      {
        id: "loc_1",
        name: "Kantor Pusat Nutrilife (Jakarta)",
        latitude: -6.175392,
        longitude: 106.827153,
        radiusMeters: 150,
        isActive: true,
      },
    ];

    this.shifts = [
      {
        id: "shift_1",
        name: "Shift Reguler",
        startTime: "08:00",
        endTime: "17:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        lateToleranceMinutes: 15,
      },
      {
        id: "shift_2",
        name: "Shift Pagi",
        startTime: "07:00",
        endTime: "13:00",
        breakStartTime: "10:00",
        breakEndTime: "10:30",
        lateToleranceMinutes: 15,
      },
      {
        id: "shift_3",
        name: "Shift Siang",
        startTime: "13:00",
        endTime: "21:00",
        breakStartTime: "16:30",
        breakEndTime: "17:30",
        lateToleranceMinutes: 15,
      },
    ];

    for (const u of this.users) {
      if (!u.shiftId) u.shiftId = "shift_1";
    }

    // Attendance records start empty
    this.attendances = [];

    // Seed dummy pending leave request for GM approval testing
    this.leaves = [
      {
        id: "leave_demo_1",
        userId: "usr_emp_1",
        userName: "Ahmad Fauzi",
        userDivision: "OPERASIONAL",
        type: "CUTI_TAHUNAN",
        startDate: "2026-11-01",
        endDate: "2026-11-03",
        durationDays: 3,
        reason: "Acara keluarga tahunan",
        status: "MENUNGGU_GM",
        createdAt: Date.now() - 3600000,
      },
    ];

    this.auditLogs = [
      {
        id: "log_init",
        action: "SYSTEM_INITIALIZE",
        details: "HRIS Nutrilife Database initialized",
        createdAt: Date.now(),
      },
    ];

    await this.syncFromD1();
    this.syncApprovedLeaveAttendances();

    this.initialized = true;
  }
}

// Global instance to survive HMR in dev
const globalForStore = globalThis as unknown as { hrisStore?: HRISDataStore };
if (globalForStore.hrisStore && typeof globalForStore.hrisStore.syncFromD1 !== "function") {
  globalForStore.hrisStore = undefined;
}
export const dataStore = globalForStore.hrisStore ?? new HRISDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.hrisStore = dataStore;
