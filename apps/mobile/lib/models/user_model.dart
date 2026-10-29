class UserModel {
  final String id;
  final String nik;
  final String name;
  final String email;
  final String role;
  final String division;
  final String jobPosition;
  final int leaveQuota;

  UserModel({
    required this.id,
    required this.nik,
    required this.name,
    required this.email,
    required this.role,
    required this.division,
    required this.jobPosition,
    required this.leaveQuota,
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
    );
  }
}
