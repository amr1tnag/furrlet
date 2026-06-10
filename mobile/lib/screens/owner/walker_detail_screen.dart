import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';

class WalkerDetailScreen extends StatefulWidget {
  final String walkerId;
  const WalkerDetailScreen({super.key, required this.walkerId});

  @override
  State<WalkerDetailScreen> createState() => _WalkerDetailScreenState();
}

class _WalkerDetailScreenState extends State<WalkerDetailScreen> {
  Map<String, dynamic>? _walker;
  List<dynamic> _dogs = [];
  List<dynamic> _reviews = [];
  bool _loading = true;

  String _dogId = '';
  String _date = '';
  String _duration = '60';
  String _address = '';

  int get _price => _duration == '30' ? 99 : _duration == '45' ? 149 : 199;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final results = await Future.wait([
      ApiService.getWalker(widget.walkerId),
      ApiService.getDogs(),
      ApiService.getReviews(widget.walkerId),
    ]);
    setState(() {
      _walker = results[0] as Map<String, dynamic>?;
      _dogs = results[1] as List;
      _reviews = results[2] as List;
      if (_dogs.isNotEmpty) _dogId = _dogs[0]['id'];
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B))));
    if (_walker == null) return const Scaffold(body: Center(child: Text('Walker not found')));

    final name = _walker!['user']?['name'] ?? '';
    final city = _walker!['city'] ?? '';
    final bio = _walker!['bio'] ?? '';
    final availability = _walker!['availability'] ?? '';
    final verified = _walker!['verified'] ?? false;
    final rating = (_walker!['rating'] ?? 0.0).toDouble();
    final reviewCount = _walker!['reviewCount'] ?? 0;
    final photoUrl = _walker!['photoUrl'] ?? '';

    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(title: Text(name)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Walker info card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Container(
                    width: 72, height: 72,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), color: const Color(0xFFFFF7ED),
                        image: photoUrl.isNotEmpty ? DecorationImage(image: NetworkImage(photoUrl), fit: BoxFit.cover) : null),
                    child: photoUrl.isEmpty ? const Center(child: Text('🦮', style: TextStyle(fontSize: 36))) : null,
                  ),
                  const SizedBox(width: 14),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                      if (verified) ...[const SizedBox(width: 8),
                        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                            child: const Text('✓ ID', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF2563EB)))),
                      ],
                    ]),
                    const SizedBox(height: 4),
                    Text('📍 $city', style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
                    if (rating > 0) ...[
                      const SizedBox(height: 4),
                      Row(children: [
                        Text('⭐ ${rating.toStringAsFixed(1)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                        Text('  ($reviewCount reviews)', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                      ]),
                    ],
                  ])),
                ]),
                const SizedBox(height: 16),
                Text(bio, style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280), height: 1.5)),
                const SizedBox(height: 12),
                Row(children: [
                  const Text('🕐 ', style: TextStyle(fontSize: 14)),
                  Text(availability, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                ]),
              ]),
            ),

            const SizedBox(height: 16),

            // Booking form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                const Text('Book a Walk', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                const SizedBox(height: 16),

                // Dog picker
                const Text('Select Dog', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                const SizedBox(height: 6),
                _dogs.isEmpty
                    ? GestureDetector(
                        onTap: () => context.push('/bookings'),
                        child: Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFDE68A))),
                          child: const Text('No dogs added yet. Tap to manage dogs →',
                              style: TextStyle(color: Color(0xFFB45309), fontSize: 13)),
                        ),
                      )
                    : DropdownButtonFormField<String>(
                        value: _dogId.isNotEmpty ? _dogId : null,
                        decoration: const InputDecoration(),
                        items: _dogs.map((d) => DropdownMenuItem<String>(value: d['id'], child: Text('${d['name']} (${d['breed']})'))).toList(),
                        onChanged: (v) => setState(() => _dogId = v ?? ''),
                      ),

                const SizedBox(height: 16),

                // Date picker
                const Text('Date', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                const SizedBox(height: 6),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now().add(const Duration(days: 1)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 90)),
                      builder: (context, child) => Theme(
                        data: Theme.of(context).copyWith(colorScheme: const ColorScheme.light(primary: Color(0xFFF59E0B))),
                        child: child!,
                      ),
                    );
                    if (picked != null) setState(() => _date = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}');
                  },
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE5E7EB)), borderRadius: BorderRadius.circular(12)),
                    child: Row(children: [
                      const Icon(Icons.calendar_today, size: 16, color: Color(0xFF9CA3AF)),
                      const SizedBox(width: 8),
                      Text(_date.isEmpty ? 'Pick a date' : _date,
                          style: TextStyle(color: _date.isEmpty ? const Color(0xFF9CA3AF) : const Color(0xFF111827), fontSize: 14)),
                    ]),
                  ),
                ),

                const SizedBox(height: 16),

                // Duration
                const Text('Duration', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                const SizedBox(height: 6),
                Row(children: [
                  for (final opt in [['30', '30 min', '₹99'], ['45', '45 min', '₹149'], ['60', '1 hr', '₹199']])
                    Expanded(child: Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _duration = opt[0]),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _duration == opt[0] ? const Color(0xFFFFFBEB) : Colors.white,
                            border: Border.all(color: _duration == opt[0] ? const Color(0xFFF59E0B) : const Color(0xFFE5E7EB), width: _duration == opt[0] ? 2 : 1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(children: [
                            Text(opt[1], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _duration == opt[0] ? const Color(0xFFB45309) : const Color(0xFF6B7280))),
                            Text(opt[2], style: TextStyle(fontSize: 11, color: _duration == opt[0] ? const Color(0xFFF59E0B) : const Color(0xFF9CA3AF))),
                          ]),
                        ),
                      ),
                    )),
                ]),

                const SizedBox(height: 16),

                // Address
                const Text('Pickup address', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                const SizedBox(height: 6),
                TextField(
                  maxLines: 2,
                  decoration: const InputDecoration(hintText: 'e.g. Flat 4B, Sunshine Apartments, MG Road'),
                  onChanged: (v) => _address = v,
                ),
                const SizedBox(height: 4),
                Text('The walker will come here to pick up your dog.', style: TextStyle(fontSize: 11, color: Colors.grey[400])),

                const SizedBox(height: 20),

                // Price summary
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFFFFFBEB), Color(0xFFFFF7ED)]),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Total to pay', style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                      Text('₹$_price', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                      Text('$_duration min walk · secured by Razorpay', style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                    ]),
                    const Text('🔒', style: TextStyle(fontSize: 32)),
                  ]),
                ),

                const SizedBox(height: 16),

                ElevatedButton(
                  onPressed: (_dogId.isEmpty || _date.isEmpty || _address.isEmpty)
                      ? null
                      : () {
                          // TODO: Integrate Razorpay SDK
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Razorpay integration coming soon'), backgroundColor: Color(0xFFF59E0B)),
                          );
                        },
                  child: Text('Pay ₹$_price & Book'),
                ),
              ]),
            ),

            // Reviews
            if (_reviews.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Reviews (${_reviews.length})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                  const SizedBox(height: 12),
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
                ]),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
