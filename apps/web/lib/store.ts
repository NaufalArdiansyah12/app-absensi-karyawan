import { hashPassword } from "./auth-jwt";

export interface UserItem {
  id: string;
  nik: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_USER" | "GM" | "HR" | "FINANCE" | "EMPLOYEE";
  division: string;
  jobPosition: string;
  baseSalary: number;
  leaveQuota: number;
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
  lateToleranceMinutes: number;
}

export interface AttendanceItem {
  id: string;
  userId: string;
  userName?: string;
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
  status: "TEPAT_WAKTU" | "TERLAMBAT";
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
  lateDeduction: number;
  absentDeduction: number;
  overtimePay: number;
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

  async init() {
    if (this.initialized) return;

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
        lateToleranceMinutes: 15,
      },
    ];

    // Seed dummy attendance record
    this.attendances = [
      {
        id: "att_demo_1",
        userId: "usr_emp_1",
        userName: "Ahmad Fauzi",
        date: new Date().toISOString().split("T")[0],
        checkInTime: "07:55:00",
        checkInLat: -6.175390,
        checkInLng: 106.827150,
        checkInDistanceMeters: 5.2,
        checkInPhotoKey: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
        status: "TEPAT_WAKTU",
        lateMinutes: 0,
        overtimeMinutes: 60,
        createdAt: Date.now(),
      },
    ];

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

    this.initialized = true;
  }
}

// Global instance to survive HMR in dev
const globalForStore = globalThis as unknown as { hrisStore?: HRISDataStore };
export const dataStore = globalForStore.hrisStore ?? new HRISDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.hrisStore = dataStore;
