package perf

import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

import io.gatling.commons.stats.KO
import io.gatling.core.Predef._
import io.gatling.core.controller.inject.open.RampRateBuilder
import io.gatling.core.scenario.Simulation
import io.gatling.http.Predef._

import scala.concurrent.duration._
import scala.util.Random

class DIVOCRegistrationSimulation extends Simulation {
  private val env: String = System.getenv.getOrDefault("targetEnv", "dev")
  var baseUrl = System.getenv.getOrDefault("baseUrl", "http://ac997627af11d4f859d463cffe978de9-20f9b4ea99f0fc2d.elb.ap-south-1.amazonaws.com")
//  val token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnUkVqVXA1blE3OG9RcEJjcjZzTFpTQlNyblV5U2dNMjBUaElteVE3dzlrIn0.eyJleHAiOjE2MjczMzIxODgsImlhdCI6MTYxMDA1MjIwMCwiYXV0aF90aW1lIjoxNjEwMDUyMTg4LCJqdGkiOiJiZTcwZTVlOS05MGFhLTQ2NGItOGFlZC1lMTM5YTViOTA3NDMiLCJpc3MiOiJodHRwOi8vZGl2b2MueGl2LmluL2F1dGgvcmVhbG1zL2Rpdm9jIiwiYXVkIjpbInJlYWxtLW1hbmFnZW1lbnQiLCJhY2NvdW50IiwiZmFjaWxpdHktYWRtaW4tcG9ydGFsIl0sInN1YiI6IjdiZDU4NTUxLTlhMmItNDllNC1iYWUzLWUwZjdlNmJmNWUyYyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImZhY2lsaXR5LWFwaSIsIm5vbmNlIjoiNTFiOTIwY2QtMjg1Zi00MzU3LWE3ODUtZDE3NzBiYmVlYWRmIiwic2Vzc2lvbl9zdGF0ZSI6IjZlYjFkYTliLTE3NzYtNDYxOS04ZGMxLWJiMzA3YTVmMzI0MCIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9kaXZvYy54aXYuaW4iLCJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCIqIiwiaHR0cHM6Ly9kaXZvYy1hcHAueGl2LmluIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LXVzZXJzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktdXNlcnMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfSwiZmFjaWxpdHktYWRtaW4tcG9ydGFsIjp7InJvbGVzIjpbImZhY2lsaXR5LXN0YWZmIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiMTExMTExMTE1MiIsImZhY2lsaXR5X2NvZGUiOiJNT0IyMzQxIn0.aDi3JS6tPMHs5yjZQntQucRs5eery7xRJJpJ9yymuQVQrC64gHHGCZ5sEdUxhgzzkUU0v8_jJzzsjSBNl7P1hqMm6V1xSrIhjNYHHOX3asueyKkTuqer2elo2iqMIiZoDRCrPQxOyI3ZDWTRqdGWUTt7Pc4CKfHdiCzez0A14T7c7WuwQiGzumUq34k640o4NJcZ5kMPRIfwAr3s53XfbnRxR7cT6GwvA2-a5Ak_dHCyjaQT5aUOsgCMdqPHHCfO-3Tv1U3cho6fdI7Dxdn3ZwlnC3jM5gbMhqqos0zcRrIT9JvEZfKxMXxGVqYnbrr9zsWTzjFb-UMEwfpnAenqDQ"
  println(s"Using env ${baseUrl}")

  var noError = true
  var stat = new AtomicInteger(0)

  val httpProtocol = http
    .warmUp(baseUrl)
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  val token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJQaG9uZSI6Ijk4ODA0MTQ4ODUiLCJleHAiOjE2MTQ0NTQwOTV9.NKsDXIqnGb-GgmkvRJ5HknozmBu2M9mY_MH2gtvcyPxhP8i_jlutUsbHs4sK4UQQZLXeUtjeHEYkM2BIwHctEr_lFdCyhbjo392H19HA7cl67OgQNVF5vP2fiulTi2OND1-Ij-bjUfr9Z36H4f27adqoDfBCFKmj8EDsxad03pLA-OL3-0btcJ0ih3dmRXKEnpbiSn3Wj6lxRlO1zOORuONr-qG6qAI3fMoCnS1TbfSIBF5ujjI5IlLyK2MDvbqB0fqQZGKI0A0k0JLPQ11mWpXo0R2YjGd8TG3ov7q_fT-dSURwJwEjSVXUG2_mO2EMysiI_EP_eaa9R7ztgJRi2w"
  val headers = Map(
    "accept" -> "application/json",
    "Content-Type" -> "application/json",
//    "Authorization" -> s"Bearer ${token}"
  )

//  val feeder = Iterator.continually({Map("phone" -> Random.between(1e10, 1e11).toLong.toString)})

  val ping = http("ping")
    .get(s"${baseUrl}/test")
    .headers(headers)
    .check(status.is(404))

  val getOTP = http("Get OTP")
    .post(s"${baseUrl}/divoc/api/citizen/generateOTP")
    .headers(headers)
    .body(StringBody(
      """{"phone":"${phone}"}""".stripMargin))
    .check(status.in(200))

  val confirmOTP = http("Confirm OTP")
    .post(s"${baseUrl}/divoc/api/citizen/verifyOTP")
    .headers(headers)
    .body(StringBody("""{"phone":"${phone}", "otp":"1234"}""".stripMargin))
    .check(status.in(200))
    .check(jsonPath("$..token").ofType[String].saveAs("token"))

  val getRecipientList = http("List recipient")
    .get(s"${baseUrl}/divoc/api/citizen/recipients")
    .headers(headers)
    .header("Authorization", "Bearer ${token}")
    .check(status.is(200))

  val createMember = http("Add member")
    .post(s"${baseUrl}/divoc/api/citizen/recipients")
    .headers(headers)
    .header("Authorization", "Bearer ${token}")
    .body(StringBody("""{"programId":"1-ea490d72-52c8-4f15-a167-86155474ab65","nationalId":"did:in.gov.driverlicense:12","name":"Test ${id}","yob":1924,"gender":"Male","email":"","confirmEmail":"","comorbidities":["Heart Problem"],"status":null,"address":{"addressLine1":"","addressLine2":"","state":"Jharkhand","district":"Ranchi","pincode":"560000"},"phone":"${phone}","beneficiaryPhone":"${phone}"}"""))
    .check(status.is(200))


  val scn = scenario("Registration")
//    .feed(feeder)
    .exec(s=> {
      s.set("phone", Random.between(1e10, 1e11).toLong.toString)
    })
    .exec(ping)
//    .exec(getOTP)
//    .exec(confirmOTP)
    .exec(s=>{
      if (s.status == KO) {
        noError = false
        println(s)
        val failures = stat.incrementAndGet()
        if (failures==100) {
          java.lang.System.exit(0)
          s.eventLoop.shutdownGracefully(1000, 1000, TimeUnit.MILLISECONDS)
        }
      }
      s
    })
//    .exec(getRecipientList)
//    .repeat(4) {
//      pace(10 seconds)
//        .exec({s=>
//          s.set("id", (s.attributes.getOrElse("id", "1").toString).toLong + 1)
//          .set("r", Random.nextInt().toString)
//        }
//        )
//        .exec(getRecipientList)
//        .exec(createMember)
//        .exec(s => {
//          if (s.status == KO) {
//            noError = false
//            println(s)
//            val failures = stat.incrementAndGet()
//            if (failures==100) {
//              java.lang.System.exit(0)
//              s.eventLoop.shutdownGracefully(1000, 1000, TimeUnit.MILLISECONDS)
//            }
//          }
//          s
//        })
//    }


//  setUp(scn.inject(atOnceUsers(1)))

  setUp(scn.inject(
    atOnceUsers(1),
    rampUsersPerSec(1).to(10000).during(30 minutes)
//    rampUsers(300).during((300/5).seconds)
  )).protocols(httpProtocol).assertions(
    global.responseTime.max.lt(800),
    global.successfulRequests.percent.gt(98)
  ).maxDuration(8 hours)

}
