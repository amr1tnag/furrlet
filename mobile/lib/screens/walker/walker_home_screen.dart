import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class WalkerHomeScreen extends StatefulWidget {
  const WalkerHomeScreen({super.key});

  @override
  State<WalkerHomeScreen> createState() => _WalkerHomeScreenState();
}

class _WalkerHomeScreenState extends State<WalkerHomeScreen> {
  List<dynamic> _bookings = [];
  Map<String, dynamic>? _profile;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      ApiService.getBookings(),
      ApiService.getWalkerProfile(),
    ]);
    setState(() {
      _bookings = (results[0] as List).where((b) => b['status'] == 'PENDING' || b['status'] == 'CONFIRMED').toList();
      _profile = results[1] as Map<String, dynamic>?;
      _loading = false;
    });
  }

  Future<void> _updateStatus(String bookingId, String status) async {
    await ApiService.updateBookingStatus(bookingId: bookingId, status: status);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthService>().user;
    final isActive = _profile?['isActive'] ?? true;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hi ${user?.name.split(' ').first ?? ''} 👋', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            const Text('Your walk requests', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), fontWeight: FontWeight.w400)),
          ],
        ),
        actions: [
          IconButton(icon: const Text('💬', style: TextStyle(fontSize: 22)), onPressed: () => context.push('/messages')),
          IconButton(icon: const Icon(Icons.person_outline, size: 22, color: Color(0xFF6B7280)), onPressed: () => context.push('/walker/profile')),
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: Color(0xFF6B7280)),
            onPressed: () async {
              await context.read<AuthService>().signout();
              if (context.mounted) context.go('/auth/login');
            },
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : RefreshIndicator(
              onRefresh: _load,
              color: const Color(0xFFF59E0B),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Status card
                  Container(
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: isActive ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isActive ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
                    ),
                    child: Row(
                      children: [
                        Text(isActive ? '🟢' : '🔴', style: const TextStyle(fontSize: 20)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            isActive ? 'Your profile is live — owners can find you' : 'Your profile is paused — hidden from search',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isActive ? const Color(0xFF166534) : const Color(0xFF991B1B)),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push('/walker/profile'),
                          child: const Text('Manage', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  if (_bookings.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 48),
                        child: Column(
                          children: [
                            const Text('🐕', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            Text('No pending requests', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey[700])),
                            Text('New walk requests will appear here', style: TextStyle(color: Colors.grey[400], fontSize: 13)),
                          ],
                        ),
                      ),
                    )
                  else
                    ..._bookings.map((b) => _BookingRequestCard(booking: b, onUpdateStatus: _updateStatus)),
                ],
              ),
            ),
    );
  }
}

class _BookingRequestCard extends StatelessWidget {
  final Map<String, dynamic> booking;
  final void Function(String, String) onUpdateStatus;
  const _BookingRequestCard({required this.booking, required this.onUpdateStatus});

  @override
  Widget build(BuildContext context) {
    final ownerName = booking['owner']?['name'] ?? 'Owner';
    final dogName = booking['dog']?['name'] ?? '';
    final dogBreed = booking['dog']?['breed'] ?? '';
    final date = booking['scheduledDate'] ?? '';
    final duration = booking['duration']?.toString() ?? '';
    final price = booking['totalPrice']?.toString() ?? '';
    final address = booking['address'] ?? '';
    final status = booking['status'] ?? '';
    final id = booking['id'] ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(ownerName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFF111827))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: status == 'PENDING' ? const Color(0xFFFFFBEB) : const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: status == 'PENDING' ? const Color(0xFFB45309) : const Color(0xFF166534)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('🐕 $dogName ($dogBreed)', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          Text('📅 $date · $duration min', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          if (address.isNotEmpty) Text('📍 $address', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
          Text('₹$price', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
          if (status == 'PENDING') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => onUpdateStatus(id, 'CANCELLED'),
                    style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFFDC2626), side: const BorderSide(color: Color(0xFFFCA5A5))),
                    child: const Text('Decline'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => onUpdateStatus(id, 'CONFIRMED'),
                    child: const Text('Accept'),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
