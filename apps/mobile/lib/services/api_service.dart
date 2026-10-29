import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_constants.dart';
import '../models/user_model.dart';
import '../models/attendance_model.dart';
import '../models/leave_model.dart';
import '../models/payslip_model.dart';

class ApiService {
  static const String _tokenKey = 'jwt_token';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<Map<String, String>> _authHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // 1. Login
  static Future<UserModel> login(String nikOrEmail, String password) async {
    final response = await http.post(
      Uri.parse(ApiConstants.login),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'nikOrEmail': nikOrEmail, 'password': password}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      await saveToken(data['token']);
      return UserModel.fromJson(data['user']);
    } else {
      throw Exception(data['error'] ?? 'Gagal masuk');
    }
  }

  // 2. Profile & Balance
  static Future<UserModel> getProfile() async {
    final response = await http.get(
      Uri.parse(ApiConstants.me),
      headers: await _authHeaders(),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return UserModel.fromJson(data['user']);
    } else {
      throw Exception(data['error'] ?? 'Gagal memuat profil');
    }
  }

  // 3. Attendance Check-in
  static Future<AttendanceModel> checkIn(
      double lat, double lng, String photoBase64OrUrl) async {
    final response = await http.post(
      Uri.parse(ApiConstants.checkIn),
      headers: await _authHeaders(),
      body: jsonEncode({
        'latitude': lat,
        'longitude': lng,
        'photoDataUrlOrKey': photoBase64OrUrl,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return AttendanceModel.fromJson(data['attendance']);
    } else {
      throw Exception(data['error'] ?? 'Gagal absensi masuk');
    }
  }

  // 4. Attendance Check-out
  static Future<AttendanceModel> checkOut(
      double lat, double lng, String photoBase64OrUrl) async {
    final response = await http.post(
      Uri.parse(ApiConstants.checkOut),
      headers: await _authHeaders(),
      body: jsonEncode({
        'latitude': lat,
        'longitude': lng,
        'photoDataUrlOrKey': photoBase64OrUrl,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return AttendanceModel.fromJson(data['attendance']);
    } else {
      throw Exception(data['error'] ?? 'Gagal absensi pulang');
    }
  }

  // 5. Attendance History
  static Future<List<AttendanceModel>> getAttendanceHistory() async {
    final response = await http.get(
      Uri.parse(ApiConstants.attendanceHistory),
      headers: await _authHeaders(),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final list = (data['attendances'] as List)
          .map((item) => AttendanceModel.fromJson(item))
          .toList();
      return list;
    } else {
      throw Exception(data['error'] ?? 'Gagal memuat histori');
    }
  }

  // 6. Apply Leave
  static Future<void> applyLeave({
    required String type,
    required String startDate,
    required String endDate,
    required int durationDays,
    required String reason,
  }) async {
    final response = await http.post(
      Uri.parse(ApiConstants.leavesApply),
      headers: await _authHeaders(),
      body: jsonEncode({
        'type': type,
        'startDate': startDate,
        'endDate': endDate,
        'durationDays': durationDays,
        'reason': reason,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode != 200) {
      throw Exception(data['error'] ?? 'Gagal mengajukan permohonan');
    }
  }

  // 7. Get My Leaves
  static Future<Map<String, dynamic>> getMyLeaves() async {
    final response = await http.get(
      Uri.parse(ApiConstants.myLeaves),
      headers: await _authHeaders(),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final leaves = (data['leaves'] as List)
          .map((i) => LeaveModel.fromJson(i))
          .toList();
      return {
        'leaves': leaves,
        'leaveQuota': data['leaveQuota'] ?? 0,
      };
    } else {
      throw Exception(data['error'] ?? 'Gagal memuat daftar cuti');
    }
  }

  // 8. Get My Payslips
  static Future<List<PayslipModel>> getMyPayslips() async {
    final response = await http.get(
      Uri.parse(ApiConstants.payslip),
      headers: await _authHeaders(),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final slips = (data['slips'] as List)
          .map((i) => PayslipModel.fromJson(i))
          .toList();
      return slips;
    } else {
      throw Exception(data['error'] ?? 'Gagal memuat slip gaji');
    }
  }
}
