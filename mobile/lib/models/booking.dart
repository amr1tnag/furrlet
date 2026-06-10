class Booking {
  final String id;
  final String status;
  final String date;
  final int duration;
  final double totalPrice;
  final String paymentStatus;
  final String address;
  final Dog? dog;
  final BookingUser? walker;
  final BookingUser? owner;
  final bool trackingActive;
  final double? lat;
  final double? lng;

  Booking({
    required this.id,
    required this.status,
    required this.date,
    required this.duration,
    required this.totalPrice,
    required this.paymentStatus,
    required this.address,
    this.dog,
    this.walker,
    this.owner,
    required this.trackingActive,
    this.lat,
    this.lng,
  });

  factory Booking.fromJson(Map<String, dynamic> json) => Booking(
        id: json['id'] ?? '',
        status: json['status'] ?? 'PENDING',
        date: json['date'] ?? '',
        duration: json['duration'] ?? 0,
        totalPrice: (json['totalPrice'] ?? 0).toDouble(),
        paymentStatus: json['paymentStatus'] ?? 'UNPAID',
        address: json['address'] ?? '',
        dog: json['dog'] != null ? Dog.fromJson(json['dog']) : null,
        walker: json['walker'] != null ? BookingUser.fromJson(json['walker']) : null,
        owner: json['owner'] != null ? BookingUser.fromJson(json['owner']) : null,
        trackingActive: json['trackingActive'] ?? false,
        lat: json['lat']?.toDouble(),
        lng: json['lng']?.toDouble(),
      );
}

class Dog {
  final String id;
  final String name;
  final String breed;
  final String size;

  Dog({required this.id, required this.name, required this.breed, required this.size});

  factory Dog.fromJson(Map<String, dynamic> json) => Dog(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        breed: json['breed'] ?? '',
        size: json['size'] ?? '',
      );
}

class BookingUser {
  final String id;
  final String name;

  BookingUser({required this.id, required this.name});

  factory BookingUser.fromJson(Map<String, dynamic> json) => BookingUser(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
      );
}
