class Walker {
  final String id;
  final String name;
  final String bio;
  final String city;
  final String availability;
  final double rating;
  final int reviewCount;
  final String photoUrl;
  final bool verified;
  final bool isActive;

  Walker({
    required this.id,
    required this.name,
    required this.bio,
    required this.city,
    required this.availability,
    required this.rating,
    required this.reviewCount,
    required this.photoUrl,
    required this.verified,
    required this.isActive,
  });

  factory Walker.fromJson(Map<String, dynamic> json) => Walker(
        id: json['user']?['id'] ?? json['userId'] ?? '',
        name: json['user']?['name'] ?? '',
        bio: json['bio'] ?? '',
        city: json['city'] ?? '',
        availability: json['availability'] ?? '',
        rating: (json['rating'] ?? 0).toDouble(),
        reviewCount: json['reviewCount'] ?? 0,
        photoUrl: json['photoUrl'] ?? '',
        verified: json['verified'] ?? false,
        isActive: json['isActive'] ?? true,
      );
}
