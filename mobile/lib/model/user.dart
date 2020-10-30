import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String mobile;
  final String email;
  final String name;
  final String role;

  User({this.email, this.name, this.mobile, this.role});


  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class EnrollUser {
  final String dob;
  final String gender;
  final String name;
  final String programName;


  EnrollUser(this.dob, this.gender, this.name, this.programName);

  factory EnrollUser.fromJson(Map<String, dynamic> json) => _$EnrollUserFromJson(json);

  Map<String, dynamic> toJson() => _$EnrollUserToJson(this);
}
