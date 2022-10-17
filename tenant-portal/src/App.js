import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {useKeycloak} from "@react-keycloak/web";
import Login from './components/Login';
import Home from "./components/Home/Home";
import {PrivateRoute} from "./utils/PrivateRoute";
import CreateSchema from "./components/CreateSchema/CreateSchema";
import config from "./config.json"
import Footer from "./components/Footer/Footer";

function App() {
  const {initialized, keycloak} = useKeycloak();
  if (!initialized) {
    return <div>Loading...</div>
  }

  return (
      <div>
          <Router>
              <Switch>
                  <Route exact path={config.urlPath + "/"} component={Home}/>
                  <Route exact path={config.urlPath + "/login"} component={Login}/>
                  <PrivateRoute path={config.urlPath + "/create-schema"} element={<CreateSchema />} role={"tenant"} clientId={"certificate-login"}/>
              </Switch>
          </Router>
          <Footer/>
      </div>
  );
}

export default App;
