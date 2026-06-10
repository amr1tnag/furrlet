import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class TrackingScreen extends StatefulWidget {
  final String bookingId;
  const TrackingScreen({super.key, required this.bookingId});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  Map<String, dynamic>? _location;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _load());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    final data = await ApiService.getLocation(widget.bookingId);
    setState(() => _location = data);
  }

  @override
  Widget build(BuildContext context) {
    final lat = _location?['lat'];
    final lng = _location?['lng'];
    final updatedAt = _location?['updatedAt'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(title: const Text('Live Tracking')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('📍', style: TextStyle(fontSize: 64)),
              const SizedBox(height: 16),
              const Text('Walker Location', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
              const SizedBox(height: 24),
              if (lat == null || lng == null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(16)),
                  child: const Text('Waiting for walker to share location...', style: TextStyle(color: Color(0xFFB45309), fontSize: 14), textAlign: TextAlign.center),
                )
              else
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
                  ),
                  child: Column(
                    children: [
                      Text('$lat, $lng', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                      const SizedBox(height: 8),
                      Text('Last updated: $updatedAt', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                    ],
                  ),
                ),
              const SizedBox(height: 24),
              TextButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh, color: Color(0xFFF59E0B)),
                label: const Text('Refresh', style: TextStyle(color: Color(0xFFF59E0B))),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
