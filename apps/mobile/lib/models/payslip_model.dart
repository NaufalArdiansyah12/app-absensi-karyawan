class PayslipModel {
  final String id;
  final int month;
  final int year;
  final int baseSalary;
  final int allowance;
  final int lateDeduction;
  final int absentDeduction;
  final int overtimePay;
  final int taxAndBpjs;
  final int netSalary;
  final String status;

  PayslipModel({
    required this.id,
    required this.month,
    required this.year,
    required this.baseSalary,
    required this.allowance,
    required this.lateDeduction,
    required this.absentDeduction,
    required this.overtimePay,
    required this.taxAndBpjs,
    required this.netSalary,
    required this.status,
  });

  factory PayslipModel.fromJson(Map<String, dynamic> json) {
    return PayslipModel(
      id: json['id'] ?? '',
      month: json['month'] ?? 0,
      year: json['year'] ?? 0,
      baseSalary: json['baseSalary'] ?? 0,
      allowance: json['allowance'] ?? 0,
      lateDeduction: json['lateDeduction'] ?? 0,
      absentDeduction: json['absentDeduction'] ?? 0,
      overtimePay: json['overtimePay'] ?? 0,
      taxAndBpjs: json['taxAndBpjs'] ?? 0,
      netSalary: json['netSalary'] ?? 0,
      status: json['status'] ?? 'DRAFT',
    );
  }
}
