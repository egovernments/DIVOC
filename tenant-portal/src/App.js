import "./App.css";
import { BrowserRouter as Router, Route, Routes , Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import Login from "./components/Login";
import Home from "./components/Home/Home";
import { PrivateRoute } from "./utils/PrivateRoute";
import CreateSchema from "./components/CreateSchema/CreateSchema";
import Header from "./components/Header/Header"
import config from "./config.json"
import Footer from "./components/Footer/Footer";
import GenerateToken from "./components/GenerateToken/GenerateToken";
import ToastComponent from './components/Toast/Toast';
import axios from 'axios';
import './i18n';

function App() {
  const { initialized, keycloak } = useKeycloak();
    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response.status === 401) {
                keycloak.logout()

            }
            else if (error.response.status === 403) {
                <ToastComponent header="Unauthorized access" toastBody="You are not authorized to view this resource" />

            }
            else if(error.response){
                <ToastComponent header="Error" toastBody={error.response.data} />
            }
        });

    if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Router>
      <Header/>
      <div style={{paddingBottom: "3rem", paddingTop: "3rem"}}>
        <Routes>
        
          <Route exact path={config.urlPath + "/"} element={<Home />} />
          <Route exact path={config.urlPath + "/login"} element={<Login />} />
          <Route exact path={config.urlPath + "/generate-token"} element={<GenerateToken />} />
          <Route path={config.urlPath + "/create-schema"}
             element={
                        <PrivateRoute>
                          <CreateSchema /> role={"tenant"} clientId={"registry-frontend"}
                        </PrivateRoute>
                     }
           >
           </Route>
        </Routes>
        </div>
      <Footer/>
      </Router>
      <ToastComponent/>
    </div>
  );
}

export default App;
