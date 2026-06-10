import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_service.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  String _role = 'OWNER';
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  Future<void> _signup() async {
    if (_nameCtrl.text.trim().isEmpty || _emailCtrl.text.trim().isEmpty || _passwordCtrl.text.isEmpty) {
      setState(() => _error = 'All fields are required');
      return;
    }
    setState(() { _loading = true; _error = null; });
    final res = await ApiService.signup(
      name: _nameCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      password: _passwordCtrl.text,
      role: _role,
    );
    if (!mounted) return;
    if (res['error'] != null) {
      setState(() { _error = res['error']; _loading = false; });
    } else {
      context.go('/auth/verify', extra: {
        'email': _emailCtrl.text.trim(),
        'name': _nameCtrl.text.trim(),
        'role': _role,
        'password': _passwordCtrl.text,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 32),
              const Center(child: Text('🐾', style: TextStyle(fontSize: 48))),
              const SizedBox(height: 10),
              const Center(child: Text('Create your account', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF111827)))),
              const SizedBox(height: 4),
              Center(child: Text('Free forever. No credit card required.', style: TextStyle(color: Colors.grey[500], fontSize: 13))),
              const SizedBox(height: 32),

              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, 4))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Role picker
                    const Text('I am a...', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: _RoleButton(emoji: '🐕', label: 'Dog Owner', value: 'OWNER', selected: _role == 'OWNER', onTap: () => setState(() => _role = 'OWNER'))),
                        const SizedBox(width: 12),
                        Expanded(child: _RoleButton(emoji: '🦮', label: 'Dog Walker', value: 'WALKER', selected: _role == 'WALKER', onTap: () => setState(() => _role = 'WALKER'))),
                      ],
                    ),
                    const SizedBox(height: 16),

                    const Text('Full name', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                    const SizedBox(height: 6),
                    TextField(controller: _nameCtrl, decoration: const InputDecoration(hintText: 'Alex Johnson')),
                    const SizedBox(height: 16),

                    const Text('Email address', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                    const SizedBox(height: 6),
                    TextField(controller: _emailCtrl, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(hintText: 'you@example.com')),
                    const SizedBox(height: 16),

                    const Text('Password', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _passwordCtrl,
                      obscureText: _obscure,
                      decoration: InputDecoration(
                        hintText: 'Min. 8 characters',
                        suffixIcon: IconButton(
                          icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                          onPressed: () => setState(() => _obscure = !_obscure),
                        ),
                      ),
                    ),

                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
                        child: Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
                      ),
                    ],

                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _loading ? null : _signup,
                      child: _loading
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Create free account'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Already have an account? ', style: TextStyle(color: Colors.grey[500], fontSize: 14)),
                  GestureDetector(
                    onTap: () => context.go('/auth/login'),
                    child: const Text('Sign in', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.w700, fontSize: 14)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String emoji, label, value;
  final bool selected;
  final VoidCallback onTap;
  const _RoleButton({required this.emoji, required this.label, required this.value, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFFFFBEB) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? const Color(0xFFF59E0B) : const Color(0xFFE5E7EB), width: selected ? 2 : 1),
        ),
        child: Column(children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: selected ? const Color(0xFFB45309) : const Color(0xFF6B7280))),
        ]),
      ),
    );
  }
}
