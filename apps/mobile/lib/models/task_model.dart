class TaskModel {
  final String id;
  final String title;
  final String description;
  final String assignedBy;
  final String? assignedByName;
  final String assignedTo;
  final String? assignedToName;
  final String? assignedToDivision;
  final String priority; // LOW, MEDIUM, HIGH, URGENT
  String status; // PENDING, IN_PROGRESS, COMPLETED, CLOSED
  final String dueDate;
  String? completionNotes;
  String? revisionNotes;
  final int createdAt;
  final int updatedAt;

  TaskModel({
    required this.id,
    required this.title,
    required this.description,
    required this.assignedBy,
    this.assignedByName,
    required this.assignedTo,
    this.assignedToName,
    this.assignedToDivision,
    required this.priority,
    required this.status,
    required this.dueDate,
    this.completionNotes,
    this.revisionNotes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      assignedBy: json['assignedBy'] ?? '',
      assignedByName: json['assignedByName'],
      assignedTo: json['assignedTo'] ?? '',
      assignedToName: json['assignedToName'],
      assignedToDivision: json['assignedToDivision'],
      priority: json['priority'] ?? 'MEDIUM',
      status: json['status'] ?? 'PENDING',
      dueDate: json['dueDate'] ?? '',
      completionNotes: json['completionNotes'],
      revisionNotes: json['revisionNotes'],
      createdAt: json['createdAt'] ?? 0,
      updatedAt: json['updatedAt'] ?? 0,
    );
  }
}
