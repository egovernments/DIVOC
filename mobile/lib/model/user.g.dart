// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) {
  return User(
    email: json['email'] as String,
    name: json['name'] as String,
    mobile: json['mobile'] as String,
    role: json['role'] as String,
  );
}

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
      'mobile': instance.mobile,
      'email': instance.email,
      'name': instance.name,
      'role': instance.role,
    };

EnrollUser _$EnrollUserFromJson(Map<String, dynamic> json) {
  return EnrollUser(
    json['dob'] as String,
    json['gender'] as String,
    json['name'] as String,
    json['programName'] as String,
  );
}

Map<String, dynamic> _$EnrollUserToJson(EnrollUser instance) =>
    <String, dynamic>{
      'dob': instance.dob,
      'gender': instance.gender,
      'name': instance.name,
      'programName': instance.programName,
    };
