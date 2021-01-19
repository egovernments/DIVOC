package perf

import io.gatling.app.Gatling
import io.gatling.core.config.GatlingPropertiesBuilder

object OSRunner {

    def main(args: Array[String]):Unit = {


      // This sets the class for the simulation we want to run.
      val simClass = "perf.OpenSaberSimulation"

      val props = new GatlingPropertiesBuilder
//      props.sourcesDirectory("./src/main/scala")
      props.binariesDirectory("./target/scala-2.13/classes")
      props.simulationClass(simClass)


      Gatling.fromMap(props.build)

    }

}
