import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<dynamic> _conversations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final data = await ApiService.getConversations();
    setState(() { _conversations = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(title: const Text('Messages')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)))
          : _conversations.isEmpty
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Text('💬', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 12),
                  Text('No messages yet', style: TextStyle(fontWeight: FontWeight.w700, color: Colors.grey[700])),
                ]))
              : ListView.builder(
                  itemCount: _conversations.length,
                  itemBuilder: (_, i) {
                    final c = _conversations[i];
                    final otherId = c['otherId'] ?? '';
                    final otherName = c['otherName'] ?? '';
                    final lastMsg = c['lastMessage'] ?? '';
                    return ListTile(
                      leading: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(color: const Color(0xFFFFF7ED), borderRadius: BorderRadius.circular(14)),
                        child: const Center(child: Text('🦮', style: TextStyle(fontSize: 22))),
                      ),
                      title: Text(otherName, style: const TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: Text(lastMsg, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Color(0xFF9CA3AF))),
                      onTap: () => context.push('/chat/${c['bookingId'] ?? otherId}'),
                    );
                  },
                ),
    );
  }
}
