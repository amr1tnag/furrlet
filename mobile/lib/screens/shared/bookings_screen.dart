import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<dynamic> _bookings = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final data = await ApiService.getBookings();
    setState(() { _bookings = data; _loading = false; });
  }

  Color _statusColor(String status) => switch (status) {
    'CONFIRMED' => const Color(0xFF16A34A),
    'PENDING' => const Color(0xFFD97706),
    'COMPLETED' => const Color(0xFF2563EB),
    'CANCELLED' => const Color(0xFFDC2626),
    _ => const Color(0xFF6B7280),
  };

  @override
  Widget build(BuildContext context) {
    final isOwner = context.read<AuthService>().isOwner;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(title: const Text('My Bookings')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : RefreshIndicator(
              onRefresh: _load,
              color: const Color(0xFFF59E0B),
              child: _bookings.isEmpty
                  ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Text('📋', style: TextStyle(fontSize: 48)),
                      const SizedBox(height: 12),
                      Text('No bookings yet', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey[700])),
                    ]))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _bookings.length,
                      itemBuilder: (_, i) {
                        final b = _bookings[i];
                        final status = b['status'] ?? '';
                        final date = b['scheduledDate'] ?? '';
                        final duration = b['duration']?.toString() ?? '';
                        final price = b['totalPrice']?.toString() ?? '';
                        final address = b['address'] ?? '';
                        final otherName = isOwner
                            ? (b['walker']?['user']?['name'] ?? 'Walker')
                            : (b['owner']?['name'] ?? 'Owner');
                        final dogName = b['dog']?['name'] ?? '';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(otherName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: _statusColor(status).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(status, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _statusColor(status))),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text('🐕 $dogName', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                              Text('📅 $date · $duration min', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                              if (address.isNotEmpty && !isOwner)
                                Container(
                                  margin: const EdgeInsets.only(top: 6),
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(10)),
                                  child: Row(children: [
                                    const Text('📍 ', style: TextStyle(fontSize: 13)),
                                    Expanded(child: Text(address, style: const TextStyle(fontSize: 13, color: Color(0xFF1D4ED8), fontWeight: FontWeight.w600))),
                                  ]),
                                ),
                              const SizedBox(height: 6),
                              Text('₹$price', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
