import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'https://furrlet.in/api';
  static const _storage = FlutterSecureStorage();

  static Future<String?> _getToken() async {
    return await _storage.read(key: 'session_token');
  }

  static Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await _getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Auth
  static Future<Map<String, dynamic>> signup({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/signup'),
      headers: await _headers(auth: false),
      body: jsonEncode({'name': name, 'email': email, 'password': password, 'role': role}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> signin({
    required String email,
    required String password,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/mobile-signin'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data['token'] != null) {
        await _storage.write(key: 'session_token', value: data['token']);
        return {'success': true, 'user': data['user']};
      }
    }
    return {'error': 'Invalid credentials'};
  }

  static Future<void> signout() async {
    await _storage.delete(key: 'session_token');
  }

  static Future<Map<String, dynamic>> sendOtp({
    required String email,
    required String method,
    String? phone,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/send-otp'),
      headers: await _headers(auth: false),
      body: jsonEncode({'email': email, 'method': method, if (phone != null) 'phone': phone}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: await _headers(auth: false),
      body: jsonEncode({'email': email, 'otp': otp}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>?> getMe() async {
    final res = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    return null;
  }

  // Walkers
  static Future<List<dynamic>> getWalkers({String? query}) async {
    final url = query != null && query.isNotEmpty
        ? '$baseUrl/walkers?q=${Uri.encodeComponent(query)}'
        : '$baseUrl/walkers';
    final res = await http.get(Uri.parse(url), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  static Future<Map<String, dynamic>?> getWalker(String id) async {
    final res = await http.get(Uri.parse('$baseUrl/walkers/$id'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return null;
  }

  // Dogs
  static Future<List<dynamic>> getDogs() async {
    final res = await http.get(Uri.parse('$baseUrl/dogs'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  static Future<Map<String, dynamic>> addDog({
    required String name,
    required String breed,
    required String size,
    String notes = '',
  }) async {
    final res = await http.post(
      Uri.parse('$baseUrl/dogs'),
      headers: await _headers(),
      body: jsonEncode({'name': name, 'breed': breed, 'size': size, 'notes': notes}),
    );
    return jsonDecode(res.body);
  }

  // Bookings
  static Future<List<dynamic>> getBookings() async {
    final res = await http.get(Uri.parse('$baseUrl/bookings'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  static Future<Map<String, dynamic>> updateBookingStatus({
    required String bookingId,
    required String status,
  }) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/bookings/$bookingId'),
      headers: await _headers(),
      body: jsonEncode({'status': status}),
    );
    return jsonDecode(res.body);
  }

  // Walker profile
  static Future<Map<String, dynamic>?> getWalkerProfile() async {
    final res = await http.get(Uri.parse('$baseUrl/walkers/me'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return null;
  }

  static Future<void> toggleWalkerActive(bool isActive) async {
    await http.patch(
      Uri.parse('$baseUrl/walkers'),
      headers: await _headers(),
      body: jsonEncode({'isActive': isActive}),
    );
  }

  static Future<List<dynamic>> getMyReviews() async {
    final res = await http.get(Uri.parse('$baseUrl/reviews/me'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  // Conversations
  static Future<List<dynamic>> getConversations() async {
    final res = await http.get(Uri.parse('$baseUrl/messages'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  // Location tracking
  static Future<void> updateLocation({
    required String bookingId,
    required double lat,
    required double lng,
  }) async {
    await http.post(
      Uri.parse('$baseUrl/bookings/$bookingId/location'),
      headers: await _headers(),
      body: jsonEncode({'lat': lat, 'lng': lng}),
    );
  }

  static Future<Map<String, dynamic>?> getLocation(String bookingId) async {
    final res = await http.get(
      Uri.parse('$baseUrl/bookings/$bookingId/location'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    return null;
  }

  // Reviews
  static Future<List<dynamic>> getReviews(String walkerId) async {
    final res = await http.get(Uri.parse('$baseUrl/reviews/$walkerId'), headers: await _headers());
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  // Messages
  static Future<List<dynamic>> getMessages(String bookingId) async {
    final res = await http.get(
      Uri.parse('$baseUrl/messages/$bookingId'),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    return [];
  }

  static Future<void> sendMessage({required String bookingId, required String body}) async {
    await http.post(
      Uri.parse('$baseUrl/messages/$bookingId'),
      headers: await _headers(),
      body: jsonEncode({'body': body}),
    );
  }
}
