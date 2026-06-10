import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class BookingConfirmScreen extends StatelessWidget {
  final Map<String, dynamic> booking;
  const BookingConfirmScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final walkerName = booking['walker']?['user']?['name'] ?? '';
    final date = booking['scheduledDate'] ?? '';
    final duration = booking['duration']?.toString() ?? '60';
    final price = booking['totalPrice']?.toString() ?? '';
    final address = booking['address'] ?? '';
    final dogName = booking['dog']?['name'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              const Text('🎉', style: TextStyle(fontSize: 64)),
              const SizedBox(height: 16),
              const Text('Booking Confirmed!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
              const SizedBox(height: 8),
              Text('Your walk has been booked successfully.', style: TextStyle(fontSize: 14, color: Colors.grey[500])),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                ),
                child: Column(
                  children: [
                    _row('Walker', walkerName),
                    _row('Dog', dogName),
                    _row('Date', date),
                    _row('Duration', '$duration min'),
                    _row('Pickup', address),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Paid', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text('₹$price', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Color(0xFF111827))),
                      ],
                    ),
                  ],
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () => context.go('/bookings'),
                child: const Text('View My Bookings'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/owner/home'),
                child: const Text('Back to Home', style: TextStyle(color: Color(0xFF6B7280))),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
        Flexible(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF111827)), textAlign: TextAlign.right)),
      ],
    ),
  );
}
