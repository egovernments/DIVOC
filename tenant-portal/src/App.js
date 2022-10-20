import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import Login from "./components/Login";
import Home from "./components/Home/Home";
import { PrivateRoute } from "./utils/PrivateRoute";
import CreateSchema from "./components/CreateSchema/CreateSchema";
import config from "./config.json"
import Footer from "./components/Footer/Footer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      toast.error("Incorrect User name/Password");
    }
    else if (error.response.status === 403) {
      toast.error("Error 403");
    }
    else if(error.response){
      toast.error("Some error occured.");
    }
  });

function App() {
  const { initialized, keycloak } = useKeycloak();
  if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Router>
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
      <Footer/>
      <ToastContainer/>
    </div>
  );
}

export default App;
