import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class WalkerProfileScreen extends StatefulWidget {
  const WalkerProfileScreen({super.key});

  @override
  State<WalkerProfileScreen> createState() => _WalkerProfileScreenState();
}

class _WalkerProfileScreenState extends State<WalkerProfileScreen> {
  Map<String, dynamic>? _profile;
  List<dynamic> _reviews = [];
  bool _loading = true;
  bool _toggling = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      ApiService.getWalkerProfile(),
      ApiService.getMyReviews(),
    ]);
    setState(() {
      _profile = results[0] as Map<String, dynamic>?;
      _reviews = results[1] as List;
      _loading = false;
    });
  }

  Future<void> _toggleActive() async {
    setState(() => _toggling = true);
    final current = _profile?['isActive'] ?? true;
    await ApiService.toggleWalkerActive(!current);
    await _load();
    setState(() => _toggling = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B))));

    final isActive = _profile?['isActive'] ?? true;
    final bio = _profile?['bio'] ?? '';
    final city = _profile?['city'] ?? '';
    final avgRating = _reviews.isEmpty ? 0.0 : _reviews.map((r) => (r['rating'] ?? 0).toDouble()).reduce((a, b) => a + b) / _reviews.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(title: const Text('My Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Status toggle
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Profile Status', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        isActive ? '🟢 Live' : '🔴 Paused',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: isActive ? const Color(0xFF166534) : const Color(0xFF991B1B)),
                      ),
                    ),
                    const Spacer(),
                    ElevatedButton(
                      onPressed: _toggling ? null : _toggleActive,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isActive ? const Color(0xFFDC2626) : const Color(0xFF16A34A),
                        foregroundColor: Colors.white,
                      ),
                      child: Text(isActive ? 'Pause Profile' : 'Resume Profile'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  isActive ? 'Dog owners can find and book you.' : 'Your profile is hidden from search.',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Info
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('About', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                const SizedBox(height: 10),
                Text('📍 $city', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                const SizedBox(height: 6),
                Text(bio, style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280), height: 1.5)),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Reviews
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Reviews (${_reviews.length})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                    if (_reviews.isNotEmpty)
                      Text('⭐ ${avgRating.toStringAsFixed(1)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 12),
                if (_reviews.isEmpty)
                  Text('No reviews yet.', style: TextStyle(color: Colors.grey[400], fontSize: 13))
                else
                  ..._reviews.map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        Text(r['booking']?['owner']?['name'] ?? 'Owner', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                        Text('★' * (r['rating'] ?? 0), style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 14)),
                      ]),
                      if (r['comment'] != null && r['comment'].toString().isNotEmpty)
                        Text(r['comment'], style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                      const Divider(height: 16),
                    ]),
                  )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
