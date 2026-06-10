import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'services/auth_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/auth/verify_screen.dart';
import 'screens/owner/owner_home_screen.dart';
import 'screens/owner/walker_detail_screen.dart';
import 'screens/owner/booking_confirm_screen.dart';
import 'screens/walker/walker_home_screen.dart';
import 'screens/walker/walker_profile_screen.dart';
import 'screens/shared/bookings_screen.dart';
import 'screens/shared/messages_screen.dart';
import 'screens/shared/chat_screen.dart';
import 'screens/shared/tracking_screen.dart';
import 'screens/shared/splash_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  redirect: (context, state) {
    final auth = context.read<AuthService>();
    if (auth.loading) return '/splash';

    final loggedIn = auth.isLoggedIn;
    final onAuth = state.matchedLocation.startsWith('/auth');
    final onSplash = state.matchedLocation == '/splash';

    if (!loggedIn && !onAuth && !onSplash) return '/auth/login';
    if (loggedIn && onAuth) {
      return auth.isOwner ? '/owner/home' : '/walker/home';
    }
    return null;
  },
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),

    // Auth
    GoRoute(path: '/auth/login', builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/auth/signup', builder: (_, __) => const SignupScreen()),
    GoRoute(
      path: '/auth/verify',
      builder: (_, state) {
        final extra = state.extra as Map<String, String>?;
        return VerifyScreen(
          email: extra?['email'] ?? '',
          name: extra?['name'] ?? '',
          role: extra?['role'] ?? 'OWNER',
          password: extra?['password'] ?? '',
        );
      },
    ),

    // Owner
    GoRoute(path: '/owner/home', builder: (_, __) => const OwnerHomeScreen()),
    GoRoute(
      path: '/owner/walker/:id',
      builder: (_, state) => WalkerDetailScreen(walkerId: state.pathParameters['id']!),
    ),
    GoRoute(
      path: '/owner/booking-confirm',
      builder: (_, state) => BookingConfirmScreen(booking: state.extra as Map<String, dynamic>),
    ),

    // Walker
    GoRoute(path: '/walker/home', builder: (_, __) => const WalkerHomeScreen()),
    GoRoute(path: '/walker/profile', builder: (_, __) => const WalkerProfileScreen()),

    // Shared
    GoRoute(path: '/bookings', builder: (_, __) => const BookingsScreen()),
    GoRoute(path: '/messages', builder: (_, __) => const MessagesScreen()),
    GoRoute(
      path: '/chat/:bookingId',
      builder: (_, state) => ChatScreen(bookingId: state.pathParameters['bookingId']!),
    ),
    GoRoute(
      path: '/tracking/:bookingId',
      builder: (_, state) => TrackingScreen(bookingId: state.pathParameters['bookingId']!),
    ),
  ],
);
