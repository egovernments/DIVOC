import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import Login from './components/Login';
import CreateSchema from "./components/CreateSchema/CreateSchema";

function App() {
  const {initialized, keycloak} = useKeycloak();
  if (!initialized) {
    return <div>Loading...</div>
  }

  return (
      <div>
        <Router>
          <Switch>
            <Route exact path="/login" component={Login}/>
            <PrivateRoute exact path="/" component={CreateSchema} role={"tenant"} clientId={"certificate-login"}/>
          </Switch>
        </Router>
      </div>
  );
}

export default App;
