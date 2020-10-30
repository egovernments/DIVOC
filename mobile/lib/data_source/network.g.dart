// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'network.dart';

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

class _ApiClient implements ApiClient {
  _ApiClient(this._dio, {this.baseUrl}) {
    ArgumentError.checkNotNull(_dio, '_dio');
    baseUrl ??= 'https://59d2e150-556b-4682-8647-06bdcac65b40.mock.pstmn.io/';
  }

  final Dio _dio;

  String baseUrl;

  @override
  Future<User> login(mobileNumber, otp) async {
    ArgumentError.checkNotNull(mobileNumber, 'mobileNumber');
    ArgumentError.checkNotNull(otp, 'otp');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'mobile': mobileNumber,
      r'otp': otp
    };
    final _data = <String, dynamic>{};
    final _result = await _dio.request<Map<String, dynamic>>('/login',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = User.fromJson(_result.data);
    return value;
  }

  @override
  Future<String> requestOtp(mobileNumber) async {
    ArgumentError.checkNotNull(mobileNumber, 'mobileNumber');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{r'mobile': mobileNumber};
    final _data = <String, dynamic>{};
    final _result = await _dio.request<String>('/requestOtp',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = _result.data;
    return value;
  }

  @override
  Future<List<VaccineProgram>> vaccinePrograms() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final _result = await _dio.request<List<dynamic>>('/vaccinePrograms',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    var value = _result.data
        .map((dynamic i) => VaccineProgram.fromJson(i as Map<String, dynamic>))
        .toList();
    return value;
  }

  @override
  Future<EnrollUser> getEnrollmentDetails(enrollmentID) async {
    ArgumentError.checkNotNull(enrollmentID, 'enrollmentID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{r'id': enrollmentID};
    final _data = <String, dynamic>{};
    final _result = await _dio.request<Map<String, dynamic>>('/enrollment',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = EnrollUser.fromJson(_result.data);
    return value;
  }

  @override
  Future<List<PatientDetails>> getPatientDetails(facultyId) async {
    ArgumentError.checkNotNull(facultyId, 'facultyId');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{r'facultyId': facultyId};
    final _data = <String, dynamic>{};
    final _result = await _dio.request<List<dynamic>>('/upcomingPatient',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    var value = _result.data
        .map((dynamic i) => PatientDetails.fromJson(i as Map<String, dynamic>))
        .toList();
    return value;
  }
}
