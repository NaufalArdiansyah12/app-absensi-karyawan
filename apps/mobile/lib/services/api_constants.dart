class ApiConstants {
  static const String baseUrl = 'https://centrally-resolved-molly.ngrok-free.app/api';

  static const String login = '$baseUrl/auth/login';
  static const String me = '$baseUrl/auth/me';
  static const String checkIn = '$baseUrl/attendance/check-in';
  static const String checkOut = '$baseUrl/attendance/check-out';
  static const String attendanceHistory = '$baseUrl/attendance/history';
  static const String leavesApply = '$baseUrl/leaves/apply';
  static const String myLeaves = '$baseUrl/leaves/my-leaves';
  static const String payslip = '$baseUrl/payroll/slip';
}
