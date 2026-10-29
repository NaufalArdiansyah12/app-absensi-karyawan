import 'package:flutter/material.dart';
import '../../../models/payslip_model.dart';
import '../../../../theme/app_theme.dart';

class PayslipCard extends StatelessWidget {
  final PayslipModel slip;

  const PayslipCard({super.key, required this.slip});

  String _formatRp(int amount) {
    return 'Rp ${amount.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]}.',
        )}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Periode ${slip.month}/${slip.year}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Color(0xFF1E293B),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  slip.status,
                  style: const TextStyle(
                    color: Color(0xFF15803D),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 20),
          _buildRow('Gaji Pokok', _formatRp(slip.baseSalary)),
          _buildRow('Tunjangan Tetap', '+${_formatRp(slip.allowance)}',
              color: const Color(0xFF16A34A)),
          _buildRow('Upah Lembur', '+${_formatRp(slip.overtimePay)}',
              color: const Color(0xFF16A34A)),
          _buildRow('Potongan Telat', '-${_formatRp(slip.lateDeduction)}',
              color: const Color(0xFFE11D48)),
          _buildRow('Potongan Alfa', '-${_formatRp(slip.absentDeduction)}',
              color: const Color(0xFFE11D48)),
          _buildRow('BPJS & Pajak PPh21', '-${_formatRp(slip.taxAndBpjs)}',
              color: const Color(0xFF64748B)),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Take Home Pay (THP)',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: Color(0xFF1E293B),
                ),
              ),
              Text(
                _formatRp(slip.netSalary),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                  color: AppTheme.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String title, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title,
              style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
          Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              fontFamily: 'monospace',
              color: color ?? const Color(0xFF1E293B),
            ),
          ),
        ],
      ),
    );
  }
}
