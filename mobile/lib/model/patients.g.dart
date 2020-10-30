// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'patients.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

PatientDetails _$PatientDetailsFromJson(Map<String, dynamic> json) {
  return PatientDetails(
    json['id'] as int,
    json['srNo'] as String,
    json['name'] as String,
    json['gender'] as String,
    json['age'] as int,
    json['status'] as String,
  );
}

Map<String, dynamic> _$PatientDetailsToJson(PatientDetails instance) =>
    <String, dynamic>{
      'id': instance.id,
      'srNo': instance.srNo,
      'name': instance.name,
      'gender': instance.gender,
      'age': instance.age,
      'status': instance.status,
    };
