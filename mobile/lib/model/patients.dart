import 'package:json_annotation/json_annotation.dart';

part 'patients.g.dart';

@JsonSerializable()
class PatientDetails {
  final int id;
  final String srNo;
  final String name;
  final String gender;
  final int age;
  final String status; // verified, waiting and vaccinated

  PatientDetails(
      this.id, this.srNo, this.name, this.gender, this.age, this.status);

  factory PatientDetails.fromJson(Map<String, dynamic> json) =>
      _$PatientDetailsFromJson(json);

  Map<String, dynamic> toJson() => _$PatientDetailsToJson(this);
}
