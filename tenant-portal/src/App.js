import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import Login from "./components/Login";
import Home from "./components/Home/Home";
import { PrivateRoute } from "./utils/PrivateRoute";
import CreateSchema from "./components/CreateSchema/CreateSchema";
import config from "./config.json";
import Header from "./components/Header/Header"

function App() {
  const { initialized, keycloak } = useKeycloak();
  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Router>
      <Header/>
        <Routes>
        
          <Route exact path={config.urlPath + "/"} element={<Home />} />
          <Route exact path={config.urlPath + "/login"} element={<Login />} />
          <Route path={config.urlPath + "/create-schema"}
             element={
                        <PrivateRoute>
                          <CreateSchema /> role={"tenant"} clientId={"certificate-login"} 
                        </PrivateRoute>
                     }
           >
           </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
