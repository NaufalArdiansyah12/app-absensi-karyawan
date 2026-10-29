class LeaveModel {
  final String id;
  final String type;
  final String startDate;
  final String endDate;
  final int durationDays;
  final String reason;
  final String status;
  final String? gmNote;
  final String? hrNote;

  LeaveModel({
    required this.id,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.durationDays,
    required this.reason,
    required this.status,
    this.gmNote,
    this.hrNote,
  });

  factory LeaveModel.fromJson(Map<String, dynamic> json) {
    return LeaveModel(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      startDate: json['startDate'] ?? '',
      endDate: json['endDate'] ?? '',
      durationDays: json['durationDays'] ?? 0,
      reason: json['reason'] ?? '',
      status: json['status'] ?? 'MENUNGGU_GM',
      gmNote: json['gmNote'],
      hrNote: json['hrNote'],
    );
  }
}
