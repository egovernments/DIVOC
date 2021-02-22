package perf

import io.gatling.core.Predef._
import io.gatling.core.scenario.Simulation
import io.gatling.http.Predef._

import scala.concurrent.duration._
import scala.util.Random

class DIVOCSimulation extends Simulation {
  private val env: String = System.getenv.getOrDefault("targetEnv", "dev")
  var baseUrl = System.getenv.getOrDefault("baseUrl", "http://perf-divoc.k8s.sandboxaddis.com")
  val token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnUkVqVXA1blE3OG9RcEJjcjZzTFpTQlNyblV5U2dNMjBUaElteVE3dzlrIn0.eyJleHAiOjE2MjczMzIxODgsImlhdCI6MTYxMDA1MjIwMCwiYXV0aF90aW1lIjoxNjEwMDUyMTg4LCJqdGkiOiJiZTcwZTVlOS05MGFhLTQ2NGItOGFlZC1lMTM5YTViOTA3NDMiLCJpc3MiOiJodHRwOi8vZGl2b2MueGl2LmluL2F1dGgvcmVhbG1zL2Rpdm9jIiwiYXVkIjpbInJlYWxtLW1hbmFnZW1lbnQiLCJhY2NvdW50IiwiZmFjaWxpdHktYWRtaW4tcG9ydGFsIl0sInN1YiI6IjdiZDU4NTUxLTlhMmItNDllNC1iYWUzLWUwZjdlNmJmNWUyYyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImZhY2lsaXR5LWFwaSIsIm5vbmNlIjoiNTFiOTIwY2QtMjg1Zi00MzU3LWE3ODUtZDE3NzBiYmVlYWRmIiwic2Vzc2lvbl9zdGF0ZSI6IjZlYjFkYTliLTE3NzYtNDYxOS04ZGMxLWJiMzA3YTVmMzI0MCIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9kaXZvYy54aXYuaW4iLCJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCIqIiwiaHR0cHM6Ly9kaXZvYy1hcHAueGl2LmluIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LXVzZXJzIiwicXVlcnktZ3JvdXBzIiwicXVlcnktdXNlcnMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfSwiZmFjaWxpdHktYWRtaW4tcG9ydGFsIjp7InJvbGVzIjpbImZhY2lsaXR5LXN0YWZmIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiMTExMTExMTE1MiIsImZhY2lsaXR5X2NvZGUiOiJNT0IyMzQxIn0.aDi3JS6tPMHs5yjZQntQucRs5eery7xRJJpJ9yymuQVQrC64gHHGCZ5sEdUxhgzzkUU0v8_jJzzsjSBNl7P1hqMm6V1xSrIhjNYHHOX3asueyKkTuqer2elo2iqMIiZoDRCrPQxOyI3ZDWTRqdGWUTt7Pc4CKfHdiCzez0A14T7c7WuwQiGzumUq34k640o4NJcZ5kMPRIfwAr3s53XfbnRxR7cT6GwvA2-a5Ak_dHCyjaQT5aUOsgCMdqPHHCfO-3Tv1U3cho6fdI7Dxdn3ZwlnC3jM5gbMhqqos0zcRrIT9JvEZfKxMXxGVqYnbrr9zsWTzjFb-UMEwfpnAenqDQ"
  println(s"Using env ${baseUrl}")

  val httpProtocol = http
    .warmUp(baseUrl)
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  val headers = Map(
    "accept" -> "application/json",
    "Content-Type" -> "application/json",
    "Authorization" -> s"Bearer ${token}"
  )

//  val requestBody = RawFileBody("certificate-request.json")

  val feeder = Iterator.continually(Map("id" -> Random.nextInt()))

  val req = http("Create certificate")
    .post(s"${baseUrl}/divoc/api/v1/certify")
    .headers(headers)
    .body(StringBody("""[
                       |  {
                       |    "preEnrollmentCode": "12346${r}",
                       |    "recipient": {
                       |      "name": "Sneha K ${r}",
                       |      "dob": "1957-01-30",
                       |      "age":"63",
                       |      "gender": "Female",
                       |      "nationality": "Indian",
                       |      "identity": "did:in.gov.uidai.aadhaar:111122223344",
                       |      "contact": ["tel:${r}"]
                       |    },
                       |    "vaccination": {
                       |      "name": "COVAXIN",
                       |      "batch": "MB3428BX",
                       |      "manufacturer": "Bharat Biotech",
                       |      "date": "2020-12-02T19:21:19.646Z",
                       |      "effectiveStart": "2020-12-15",
                       |      "effectiveUntil": "2021-01-15"
                       |    },
                       |    "vaccinator": {
                       |      "name": "Sooraj Singh"
                       |    },
                       |    "facility": {
                       |      "name": "ABC Medical Center",
                       |      "address": {
                       |          "addressLine1" : "123, Koramangala",
                       |          "addressLine2" :"",
                       |          "district": "Bengaluru South",
                       |          "state":"Karnataka",
                       |          "pin" :560034
                       |      }
                       |    }
                       |  }
                       |]""".stripMargin))
    .check(status.in(200))


  val scn = scenario("Certificate")
    .feed(feeder)
    .forever() {
      pace(1 seconds)
        .exec({s=>
          s.set("r", Random.nextInt().toString)
        }
        )
        .exec(req)

    }


//  setUp(scn.inject(atOnceUsers(1)))

  setUp(scn.inject(
    atOnceUsers(1),
    rampUsers(300).during((300/5).seconds)
  )).protocols(httpProtocol).assertions(
    global.responseTime.max.lt(800),
    global.successfulRequests.percent.gt(98)
  ).maxDuration(8 hours)
}
