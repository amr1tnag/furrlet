class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final bool isVerified;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.isVerified,
  });

  bool get isOwner => role == 'OWNER';
  bool get isWalker => role == 'WALKER';

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        email: json['email'] ?? '',
        role: json['role'] ?? 'OWNER',
        isVerified: json['isVerified'] ?? false,
      );
}
