import 'package:dio/dio.dart';
import 'package:divoc/forms/vaccination_program_page.dart';
import 'package:divoc/model/user.dart';
import 'package:divoc/model/vaccine_programs.dart';
import 'package:retrofit/retrofit.dart';

part 'network.g.dart';

@RestApi(baseUrl: "https://59d2e150-556b-4682-8647-06bdcac65b40.mock.pstmn.io/")
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;

  @GET("/login")
  Future<User> login(
    @Query("mobile") String mobileNumber,
    @Query("otp") String otp,
  );

  @GET("/requestOtp")
  Future<String> requestOtp(@Query("mobile") String mobileNumber);

  @GET("/vaccinePrograms")
  Future<List<VaccineProgram>> vaccinePrograms();
}
