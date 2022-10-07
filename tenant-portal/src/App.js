import './App.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
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
          <Routes>
            <Route path="/login" element={<Login />}/>
            <PrivateRoute path="/" element={<CreateSchema />} role={"tenant"} clientId={"certificate-login"}/>
          </Routes>
        </Router>
      </div>
  );
}

export default App;
