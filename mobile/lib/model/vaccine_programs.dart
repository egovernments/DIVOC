import 'package:json_annotation/json_annotation.dart';

part 'vaccine_programs.g.dart';

@JsonSerializable()
class VaccineProgram {
  final int id;
  final String name;

  VaccineProgram(this.id, this.name);

  factory VaccineProgram.fromJson(Map<String, dynamic> json) =>
      _$VaccineProgramFromJson(json);

  Map<String, dynamic> toJson() => _$VaccineProgramToJson(this);
}
