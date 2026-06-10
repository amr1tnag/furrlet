import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  User? _user;
  bool _loading = true;

  User? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null;
  bool get isOwner => _user?.isOwner ?? false;
  bool get isWalker => _user?.isWalker ?? false;

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user');
    if (userJson != null) {
      _user = User.fromJson(jsonDecode(userJson));
    }
    _loading = false;
    notifyListeners();

    // Refresh from server
    if (_user != null) {
      await refreshUser();
    }
  }

  Future<void> refreshUser() async {
    final data = await ApiService.getMe();
    if (data != null) {
      final prefs = await SharedPreferences.getInstance();
      // Merge with existing user data for name/email
      final merged = {
        'id': data['id'],
        'name': _user?.name ?? '',
        'email': _user?.email ?? '',
        'role': data['role'],
        'isVerified': data['isVerified'],
      };
      await prefs.setString('user', jsonEncode(merged));
      _user = User.fromJson(merged);
      notifyListeners();
    }
  }

  Future<bool> signin({required String email, required String password}) async {
    final res = await ApiService.signin(email: email, password: password);
    if (res['success'] == true) {
      final me = await ApiService.getMe();
      if (me != null) {
        final userData = {
          'id': me['id'],
          'name': email.split('@')[0], // temp until we fetch full profile
          'email': email,
          'role': me['role'],
          'isVerified': me['isVerified'],
        };
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(userData));
        _user = User.fromJson(userData);
        notifyListeners();
        return true;
      }
    }
    return false;
  }

  Future<void> setUserAfterVerification({
    required String email,
    required String name,
    required String role,
  }) async {
    final me = await ApiService.getMe();
    final userData = {
      'id': me?['id'] ?? '',
      'name': name,
      'email': email,
      'role': role,
      'isVerified': true,
    };
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(userData));
    _user = User.fromJson(userData);
    notifyListeners();
  }

  Future<void> signout() async {
    await ApiService.signout();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    _user = null;
    notifyListeners();
  }
}
