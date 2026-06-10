import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../models/walker.dart';

class OwnerHomeScreen extends StatefulWidget {
  const OwnerHomeScreen({super.key});

  @override
  State<OwnerHomeScreen> createState() => _OwnerHomeScreenState();
}

class _OwnerHomeScreenState extends State<OwnerHomeScreen> {
  List<Walker> _walkers = [];
  bool _loading = true;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadWalkers();
  }

  Future<void> _loadWalkers({String query = ''}) async {
    setState(() => _loading = true);
    final data = await ApiService.getWalkers(query: query);
    setState(() {
      _walkers = data.map((w) => Walker.fromJson(w)).toList();
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthService>().user;
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Hi ${user?.name.split(' ').first ?? ''} 👋', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
            const Text('Find a trusted walker', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), fontWeight: FontWeight.w400)),
          ],
        ),
        actions: [
          IconButton(icon: const Text('📅', style: TextStyle(fontSize: 22)), onPressed: () => context.push('/bookings')),
          IconButton(icon: const Text('💬', style: TextStyle(fontSize: 22)), onPressed: () => context.push('/messages')),
          IconButton(
            icon: const Icon(Icons.logout, size: 20, color: Color(0xFF6B7280)),
            onPressed: () async {
              await context.read<AuthService>().signout();
              if (context.mounted) context.go('/auth/login');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search by name or city...',
                prefixIcon: const Icon(Icons.search, color: Color(0xFF9CA3AF)),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _loadWalkers(); })
                    : null,
              ),
              onChanged: (v) => _loadWalkers(query: v),
            ),
          ),

          // Walker list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
                : _walkers.isEmpty
                    ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        const Text('🔍', style: TextStyle(fontSize: 48)),
                        const SizedBox(height: 12),
                        Text('No walkers found', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey[700])),
                        Text('Try a different city or name', style: TextStyle(color: Colors.grey[400], fontSize: 13)),
                      ]))
                    : RefreshIndicator(
                        onRefresh: _loadWalkers,
                        color: const Color(0xFFF59E0B),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _walkers.length,
                          itemBuilder: (_, i) => _WalkerCard(walker: _walkers[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _WalkerCard extends StatelessWidget {
  final Walker walker;
  const _WalkerCard({required this.walker});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/owner/walker/${walker.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 56, height: 56,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: const Color(0xFFFFF7ED),
                image: walker.photoUrl.isNotEmpty
                    ? DecorationImage(image: NetworkImage(walker.photoUrl), fit: BoxFit.cover)
                    : null,
              ),
              child: walker.photoUrl.isEmpty ? const Center(child: Text('🦮', style: TextStyle(fontSize: 28))) : null,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Text(walker.name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(0xFF111827))),
                    if (walker.verified) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(6)),
                        child: const Text('✓ ID', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF2563EB))),
                      ),
                    ],
                  ]),
                  const SizedBox(height: 3),
                  Text('📍 ${walker.city}', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                  const SizedBox(height: 4),
                  Row(children: [
                    if (walker.rating > 0) ...[
                      const Text('⭐', style: TextStyle(fontSize: 12)),
                      Text(' ${walker.rating.toStringAsFixed(1)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                      Text(' (${walker.reviewCount})', style: const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
                    ] else
                      Text('New walker', style: TextStyle(fontSize: 12, color: Colors.grey[400])),
                  ]),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text('from', style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
                const Text('₹99', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF111827))),
                const Text('/ 30 min', style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
