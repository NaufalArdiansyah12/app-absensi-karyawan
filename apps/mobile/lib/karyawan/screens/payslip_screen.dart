import 'package:flutter/material.dart';
import '../../models/payslip_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../widgets/payslip/payslip_card.dart';

class PayslipScreen extends StatefulWidget {
  const PayslipScreen({super.key});

  @override
  State<PayslipScreen> createState() => _PayslipScreenState();
}

class _PayslipScreenState extends State<PayslipScreen> {
  List<PayslipModel> _slips = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSlips();
  }

  Future<void> _loadSlips() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.getMyPayslips();
      setState(() => _slips = data);
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text(
          'Slip Gaji Pribadi',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF1E293B),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _slips.isEmpty
              ? const Center(
                  child: Text(
                    'Belum ada slip gaji yang diterbitkan Finance.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _slips.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 16),
                  itemBuilder: (context, index) => PayslipCard(slip: _slips[index]),
                ),
    );
  }
}
