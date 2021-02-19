package perf
import io.gatling.core.Predef._
import io.gatling.core.scenario.Simulation
import io.gatling.http.Predef._

import scala.concurrent.duration._
import scala.util.Random

class OpenSaberSimulation extends Simulation {
  private val env: String = System.getenv.getOrDefault("targetEnv", "dev")
  var baseUrl = System.getenv.getOrDefault("baseUrl", "http://localhost:8081")
  val token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNHNjME9Nb21iXzZRWTdBNU5ZZkl3NkxiVWVEd3g2emlmWXpxWl9RZktRIn0.eyJleHAiOjE2MjcxMTIyNDMsImlhdCI6MTYwOTgzMjI0MywianRpIjoiMmYzN2I5NjUtOGFlYi00NTg1LThhNTAtODA4MzA4M2Y1MjVkIiwiaXNzIjoiaHR0cDovL2Rpdm9jLnhpdi5pbi9hdXRoL3JlYWxtcy9kaXZvYyIsImF1ZCI6WyJyZWFsbS1tYW5hZ2VtZW50IiwiYWNjb3VudCIsImZhY2lsaXR5LWFkbWluLXBvcnRhbCJdLCJzdWIiOiJkOWU2OGJlNC0yMDVhLTRiNDQtODMwMS0xZmVhMjU1N2YxY2YiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1hcGkiLCJzZXNzaW9uX3N0YXRlIjoiYzUzZmMxNDQtNmE3YS00OWU0LWJjODMtOWNkNTE2YWMxZTM3IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2Rpdm9jLnhpdi5pbiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7InJlYWxtLW1hbmFnZW1lbnQiOnsicm9sZXMiOlsibWFuYWdlLXVzZXJzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX0sImZhY2lsaXR5LWFkbWluLXBvcnRhbCI6eyJyb2xlcyI6WyJmYWNpbGl0eS1zdGFmZiJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImNsaWVudElkIjoiYWRtaW4tYXBpIiwiY2xpZW50SG9zdCI6IjE3Mi4yNS4wLjEwIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtYWRtaW4tYXBpIiwiY2xpZW50QWRkcmVzcyI6IjE3Mi4yNS4wLjEwIn0.cAco7UOrQD1uKuetClSk-XUNVNXmBVOL9O7ZAuhahZVyLcnRzJJht_jUFqIzzJM7x6xOL79ttm1RaSTeHhoH9I1J_BuPMPch8XNHNK3BbWYxvk8nmX3-GMucoG9nplBc_HYrfx0890HHj62fZgMI9sBkqkLArEYROcWHochbBXnD_tvP3tuyEikLdE4j8XlokqV4X1lbJo5slCBrSiDBgtWGKmgo98Eo7e673khdIAub9jW_2s9z669nv8s3XQ__lRcrIB10rpc1zhLOBtZV0P44g-FSTpNp5vecblIJoOjhDqH7_w7HGyhGam-p_SDqqua7MMnCeXoOmb87m5l1jw"
  println(s"Using env ${baseUrl}")

  val httpProtocol = http
//    .warmUp(baseUrl)
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

  val req = http("Create")
    .post(s"${baseUrl}/add")
    .headers(headers)
    .body(StringBody("""{
                       |  "id":  "open-saber.registry.create",
                       |  "ver": "1.0",
                       |  "ets": "",
                       |  "request":{
                       |    "VaccinationCertificate": {
                       |      "name" : "Sooraj",
                       |      "contact": ["tel:${r}"],
                       |      "mobile":"${r}",
                       |      "certificateId": "cert${r}",
                       |      "certificate": "{\"@context\":[\"https://www.w3.org/2018/credentials/v1\",\"https://www.who.int/2020/credentials/vaccination/v1\"],\"type\":[\"VerifiableCredential\",\"ProofOfVaccinationCredential\"],\"credentialSubject\":{\"type\":\"Person\",\"id\":\"did:in.gov.uidai.aadhaar:111122223344\",\"name\":\"Sneha K\",\"gender\":\"Female\",\"age\":\"63\",\"nationality\":\"Indian\"},\"issuer\":\"https://nha.gov.in/\",\"issuanceDate\":\"2021-01-05t22:37:25.542z\",\"evidence\":[{\"id\":\"https://nha.gov.in/evidence/vaccine/588215029\",\"feedbackUrl\":\"https://divoc.togosafe.gouv.tg/feedback/588215029\",\"infoUrl\":\"https://divoc.togosafe.gouv.tg/learn/588215029\",\"certificateId\":\"588215029\",\"type\":[\"Vaccination\"],\"batch\":\"MB3428BX\",\"vaccine\":\"COVAXIN\",\"manufacturer\":\"Bharat Biotech\",\"date\":\"2020-12-02T19:21:19.646Z\",\"effectiveStart\":\"2020-12-15\",\"effectiveUntil\":\"2021-01-15\",\"verifier\":{\"name\":\"Sooraj Singh\"},\"facility\":{\"name\":\"ABC Medical Center\",\"address\":{\"streetAddress\":\"123, Koramangala\",\"district\":\"Bengaluru South\",\"addressRegion\":\"Karnataka\",\"addressCountry\":\"IN\"}}}],\"nonTransferable\":\"true\",\"proof\":{\"type\":\"RsaSignature2018\",\"http://purl.org/dc/terms/created\":{\"type\":\"http://www.w3.org/2001/XMLSchema#dateTime\",\"@value\":\"2021-01-05T22:37:25Z\"},\"https://w3id.org/security#jws\":\"eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..imKalj7jaDNUtM8QlhuWDH3QOQ5C-VsuXB7CfANYOXZOWNVhB2RcReHOStUhIuF332HcYsl5tXEGjJIF0wFVmU4ZTwXFJKX8yspewYg59m6BSQv567x7cRaV2ysC1x2rMZRv95zZ2zjlQvD07oFRVLPyDEn55Msdua_0H-vhkOuG7gZCKZKZmbM-HmMyFoPo24RmD3PEMJUFXqIkREeyQWtcLm4JI7RGwvt_sikIGLbiHnQ0LA9auT7ezloervo53UtwCrzspJb_DhvXyABU_XMPhTptwb3MkSABATrMwMBKnwG875VkVLhBo7Ia4ue6E8KqrVKNUb4uPCM4dgfXdg\",\"https://w3id.org/security#proofPurpose\":{\"id\":\"https://w3id.org/security#assertionMethod\"},\"https://w3id.org/security#verificationMethod\":{\"id\":\"did:india\"}}}",
                       |      "meta": {}
                       |    }
                       |
                       |  }
                       |}""".stripMargin))
    .check(status.in(200))


  val scn = scenario("Get")
    .feed(feeder)
    .repeat(100) {
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
  ).maxDuration(10 minutes)
}
