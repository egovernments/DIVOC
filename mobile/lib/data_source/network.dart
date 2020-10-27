import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'network.g.dart';

@RestApi(baseUrl: "https://59d2e150-556b-4682-8647-06bdcac65b40.mock.pstmn.io/")
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;

  @GET("/login")
  Future<String> login(
    @Query("mobile") String mobileNumber,
    @Query("otp") String otp,
  );
}
