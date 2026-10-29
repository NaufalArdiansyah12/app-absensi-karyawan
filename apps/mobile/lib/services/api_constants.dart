class ApiConstants {
  // Gunakan 10.0.2.2 untuk Android Emulator atau localhost untuk browser/desktop
  static const String baseUrl = 'http://localhost:3000/api';

  static const String login = '$baseUrl/auth/login';
  static const String me = '$baseUrl/auth/me';
  static const String checkIn = '$baseUrl/attendance/check-in';
  static const String checkOut = '$baseUrl/attendance/check-out';
  static const String attendanceHistory = '$baseUrl/attendance/history';
  static const String leavesApply = '$baseUrl/leaves/apply';
  static const String myLeaves = '$baseUrl/leaves/my-leaves';
  static const String payslip = '$baseUrl/payroll/slip';
}
