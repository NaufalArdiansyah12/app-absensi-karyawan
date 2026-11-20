class ApiConstants {
  // Set true only while a tunnel forwards to Laravel port 8000.
  static const bool useNgrok = false;

  static const String _ngrokUrl = 'https://centrally-resolved-molly.ngrok-free.app/api';
  static const String _localUrl = 'http://localhost:8000/api';

  static const String baseUrl = useNgrok ? _ngrokUrl : _localUrl;

  static const String login = '$baseUrl/auth/login';
  static const String me = '$baseUrl/auth/me';
  static const String checkIn = '$baseUrl/attendance/check-in';
  static const String checkOut = '$baseUrl/attendance/check-out';
  static const String attendanceHistory = '$baseUrl/attendance/history';
  static const String leavesApply = '$baseUrl/leaves/apply';
  static const String myLeaves = '$baseUrl/leaves/my-leaves';
  static const String payslip = '$baseUrl/payroll/slip';
  static const String tasks = '$baseUrl/tasks';
  static String taskDetail(String id) => '$baseUrl/tasks/$id';
}
