class UserModel {
  final String id;
  final String nik;
  final String name;
  final String email;
  final String role;
  final String division;
  final String jobPosition;
  final int leaveQuota;
  final String? shiftId;
  final String? shiftName;
  final String? shiftHours;
  final String? shiftBreakHours;

  UserModel({
    required this.id,
    required this.nik,
    required this.name,
    required this.email,
    required this.role,
    required this.division,
    required this.jobPosition,
    required this.leaveQuota,
    this.shiftId,
    this.shiftName,
    this.shiftHours,
    this.shiftBreakHours,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      nik: json['nik'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      division: json['division'] ?? '',
      jobPosition: json['jobPosition'] ?? '',
      leaveQuota: json['leaveQuota'] ?? 0,
      shiftId: json['shiftId'],
      shiftName: json['shiftName'] ??
          (json['shift'] != null ? json['shift']['name'] : null),
      shiftHours: json['shiftHours'] ??
          (json['shift'] != null
              ? '${json['shift']['startTime']} - ${json['shift']['endTime']} WIB'
              : null),
      shiftBreakHours: json['shiftBreakHours'] ??
          (json['shift'] != null
              ? '${json['shift']['breakStartTime'] ?? '12:00'} - ${json['shift']['breakEndTime'] ?? '13:00'} WIB'
              : null),
    );
  }
}
