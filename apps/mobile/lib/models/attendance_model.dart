class AttendanceModel {
  final String id;
  final String date;
  final String checkInTime;
  final String? checkOutTime;
  final double checkInLat;
  final double checkInLng;
  final double checkInDistanceMeters;
  final String checkInPhotoKey;
  final String status;
  final int lateMinutes;
  final int overtimeMinutes;

  AttendanceModel({
    required this.id,
    required this.date,
    required this.checkInTime,
    this.checkOutTime,
    required this.checkInLat,
    required this.checkInLng,
    required this.checkInDistanceMeters,
    required this.checkInPhotoKey,
    required this.status,
    required this.lateMinutes,
    required this.overtimeMinutes,
  });

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id'] ?? '',
      date: json['date'] ?? '',
      checkInTime: json['checkInTime'] ?? '',
      checkOutTime: json['checkOutTime'],
      checkInLat: (json['checkInLat'] as num?)?.toDouble() ?? 0.0,
      checkInLng: (json['checkInLng'] as num?)?.toDouble() ?? 0.0,
      checkInDistanceMeters: (json['checkInDistanceMeters'] as num?)?.toDouble() ?? 0.0,
      checkInPhotoKey: json['checkInPhotoKey'] ?? '',
      status: json['status'] ?? 'TEPAT_WAKTU',
      lateMinutes: json['lateMinutes'] ?? 0,
      overtimeMinutes: json['overtimeMinutes'] ?? 0,
    );
  }
}
