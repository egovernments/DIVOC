// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'parser.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

FlowTree _$FlowTreeFromJson(Map<String, dynamic> json) {
  return FlowTree(
    json['metadata'] == null
        ? null
        : FlowMeta.fromJson(json['metadata'] as Map<String, dynamic>),
    json['routeKey'] as String,
    (json['nextRoutes'] as List)
        ?.map((e) =>
            e == null ? null : FlowTree.fromJson(e as Map<String, dynamic>))
        ?.toList(),
  );
}

Map<String, dynamic> _$FlowTreeToJson(FlowTree instance) => <String, dynamic>{
      'metadata': instance.flowMeta,
      'routeKey': instance.routeKey,
      'nextRoutes': instance.nextRoutes,
    };

FlowMeta _$FlowMetaFromJson(Map<String, dynamic> json) {
  return FlowMeta(
    label: json['label'] as String,
    formKey: json['formKey'] as String,
  );
}

Map<String, dynamic> _$FlowMetaToJson(FlowMeta instance) => <String, dynamic>{
      'label': instance.label,
      'formKey': instance.formKey,
    };
