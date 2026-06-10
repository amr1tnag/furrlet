import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';
import 'package:provider/provider.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';

class VerifyScreen extends StatefulWidget {
  final String email, name, role, password;
  const VerifyScreen({super.key, required this.email, required this.name, required this.role, required this.password});

  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  String _method = 'email';
  final _phoneCtrl = TextEditingController();
  bool _sent = false;
  bool _sending = false;
  bool _verifying = false;
  int _cooldown = 0;
  String? _error;
  String _otp = '';

  @override
  void dispose() {
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _startCooldown() async {
    setState(() => _cooldown = 60);
    while (_cooldown > 0) {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      setState(() => _cooldown--);
    }
  }

  Future<void> _sendOtp() async {
    setState(() { _sending = true; _error = null; });
    final res = await ApiService.sendOtp(
      email: widget.email,
      method: _method,
      phone: _method == 'phone' ? _phoneCtrl.text.trim() : null,
    );
    if (!mounted) return;
    if (res['error'] != null) {
      setState(() { _error = res['error']; _sending = false; });
    } else {
      setState(() { _sent = true; _sending = false; });
      _startCooldown();
    }
  }

  Future<void> _verify(String otp) async {
    if (otp.length < 6) return;
    setState(() { _verifying = true; _error = null; });
    final res = await ApiService.verifyOtp(email: widget.email, otp: otp);
    if (!mounted) return;
    if (res['error'] != null) {
      setState(() { _error = res['error']; _verifying = false; _otp = ''; });
    } else {
      // Sign in and navigate
      final auth = context.read<AuthService>();
      await auth.signin(email: widget.email, password: widget.password);
      if (!mounted) return;
      context.go(widget.role == 'OWNER' ? '/owner/home' : '/walker/home');
    }
  }

  final _pinTheme = PinTheme(
    width: 52,
    height: 56,
    textStyle: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFE5E7EB), width: 1.5),
      borderRadius: BorderRadius.circular(12),
    ),
  );

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
              const Center(child: Text('🔐', style: TextStyle(fontSize: 52))),
              const SizedBox(height: 12),
              const Center(child: Text('Verify your account', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF111827)))),
              const SizedBox(height: 4),
              Center(child: Text('One quick step to keep you secure', style: TextStyle(color: Colors.grey[500], fontSize: 13))),
              const SizedBox(height: 32),

              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, 4))],
                ),
                child: !_sent ? _buildMethodPicker() : _buildOtpInput(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMethodPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text('How would you like to verify?', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _MethodButton(emoji: '📧', label: 'Email OTP', selected: _method == 'email', onTap: () => setState(() => _method = 'email'))),
            const SizedBox(width: 12),
            Expanded(child: _MethodButton(emoji: '📱', label: 'Phone OTP', selected: _method == 'phone', onTap: () => setState(() => _method = 'phone'))),
          ],
        ),
        const SizedBox(height: 16),
        if (_method == 'email')
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              const Text('📧', style: TextStyle(fontSize: 20)),
              const SizedBox(width: 10),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Sending code to', style: TextStyle(fontSize: 11, color: Colors.grey[400])),
                Text(widget.email, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
              ]),
            ]),
          )
        else
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Phone number', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
              const SizedBox(height: 6),
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                    borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
                  ),
                  child: const Text('+91', style: TextStyle(fontWeight: FontWeight.w600)),
                ),
                Expanded(
                  child: TextField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    decoration: const InputDecoration(
                      hintText: '98765 43210',
                      counterText: '',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.horizontal(right: Radius.circular(12)),
                        borderSide: BorderSide(color: Color(0xFFE5E7EB)),
                      ),
                    ),
                  ),
                ),
              ]),
            ],
          ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
            child: Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
          ),
        ],
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _sending ? null : _sendOtp,
          child: _sending
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text('Send OTP to ${_method == 'email' ? 'email' : 'phone'}'),
        ),
      ],
    );
  }

  Widget _buildOtpInput() {
    return Column(
      children: [
        Text(_method == 'email' ? '📧' : '📱', style: const TextStyle(fontSize: 40)),
        const SizedBox(height: 12),
        const Text('Enter the 6-digit code', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Color(0xFF111827))),
        const SizedBox(height: 6),
        Text(
          'Sent to ${_method == 'email' ? widget.email : '+91 ${_phoneCtrl.text}'}',
          style: TextStyle(fontSize: 13, color: Colors.grey[400]),
        ),
        const SizedBox(height: 24),
        Pinput(
          length: 6,
          defaultPinTheme: _pinTheme,
          focusedPinTheme: _pinTheme.copyWith(
            decoration: _pinTheme.decoration!.copyWith(
              border: Border.all(color: const Color(0xFFF59E0B), width: 2),
            ),
          ),
          onCompleted: _verify,
          onChanged: (v) => _otp = v,
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
            child: Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13), textAlign: TextAlign.center),
          ),
        ],
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _verifying || _otp.length < 6 ? null : () => _verify(_otp),
          child: _verifying
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Verify account'),
        ),
        const SizedBox(height: 16),
        if (_cooldown > 0)
          Text('Resend in ${_cooldown}s', style: TextStyle(color: Colors.grey[400], fontSize: 13))
        else
          GestureDetector(
            onTap: () => setState(() { _sent = false; _otp = ''; _error = null; }),
            child: const Text('Resend code', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.w700, fontSize: 13)),
          ),
      ],
    );
  }
}

class _MethodButton extends StatelessWidget {
  final String emoji, label;
  final bool selected;
  final VoidCallback onTap;
  const _MethodButton({required this.emoji, required this.label, required this.selected, required this.onTap});

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
          Text(emoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: selected ? const Color(0xFFB45309) : const Color(0xFF6B7280))),
        ]),
      ),
    );
  }
}
