export type LeaveStatus =
  | "MENUNGGU_GM"
  | "DITOLAK_GM"
  | "MENUNGGU_HR"
  | "DITOLAK_HR"
  | "FINAL_DISETUJUI";

export type LeaveAction = "APPROVE" | "REJECT";

export interface TransitionResult {
  nextStatus: LeaveStatus;
  canDeductQuota: boolean;
}

/**
 * State machine untuk alur persetujuan cuti berjenjang (GM -> HR).
 */
export function transitionLeaveStatus(
  currentStatus: LeaveStatus,
  role: "GM" | "HR",
  action: LeaveAction
): TransitionResult {
  if (role === "GM") {
    if (currentStatus !== "MENUNGGU_GM") {
      throw new Error(`GM hanya dapat memproses status MENUNGGU_GM. Status saat ini: ${currentStatus}`);
    }
    return {
      nextStatus: action === "APPROVE" ? "MENUNGGU_HR" : "DITOLAK_GM",
      canDeductQuota: false,
    };
  }

  if (role === "HR") {
    if (currentStatus !== "MENUNGGU_HR") {
      throw new Error(`HR hanya dapat memproses status MENUNGGU_HR. Status saat ini: ${currentStatus}`);
    }
    return {
      nextStatus: action === "APPROVE" ? "FINAL_DISETUJUI" : "DITOLAK_HR",
      canDeductQuota: action === "APPROVE",
    };
  }

  throw new Error(`Role ${role} tidak berwenang melakukan persetujuan cuti.`);
}

/**
 * Validasi dan kurangi kuota cuti tahunan.
 */
export function deductLeaveQuota(
  currentQuota: number,
  durationDays: number,
  leaveType: string
): number {
  if (leaveType !== "CUTI_TAHUNAN") {
    return currentQuota; // Cuti non-tahunan (sakit/darurat) tidak potong kuota tahunan
  }
  if (durationDays <= 0) {
    throw new Error("Durasi cuti harus lebih besar dari 0.");
  }
  if (currentQuota < durationDays) {
    throw new Error(`Saldo cuti tidak mencukupi. Kuota tersisa: ${currentQuota}, diajukan: ${durationDays}`);
  }
  return currentQuota - durationDays;
}
