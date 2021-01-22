name := "divoc-perf"

version := "0.1"

//enablePlugins(GatlingPlugin)

scalaVersion := "2.13.4"

scalacOptions := Seq(
  "-encoding", "UTF-8", "-target:jvm-1.8", "-deprecation",
  "-feature", "-unchecked", "-language:implicitConversions", "-language:postfixOps")

val gatlingVersion = "3.5.0"
libraryDependencies += "io.gatling.highcharts" % "gatling-charts-highcharts" % gatlingVersion //% "test,it"
libraryDependencies += "io.gatling"            % "gatling-test-framework"    % gatlingVersion //% "test,it"
