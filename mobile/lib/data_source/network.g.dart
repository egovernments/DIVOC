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
  Future<String> login(mobileNumber, otp) async {
    ArgumentError.checkNotNull(mobileNumber, 'mobileNumber');
    ArgumentError.checkNotNull(otp, 'otp');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{
      r'mobile': mobileNumber,
      r'otp': otp
    };
    final _data = <String, dynamic>{};
    final _result = await _dio.request<String>('/login',
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
}
