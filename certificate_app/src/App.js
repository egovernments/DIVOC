import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Header from '../src/components/Header/Header';
import Footer from '../src/components/Footer/Footer';
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import Login from './components/Login';
import CertificateView from './components/CertificateView/CertificateView';

function App() {
  const {initialized, keycloak} = useKeycloak();
    if (!initialized) {
        return <div>Loading...</div>
    }

  return (
    <div>
      <Router>
        <Header/>
        <div>
          <Switch>
            <Route exact path="/" component={CertificateView}/>
            <Route exact path="/login" component={Login}/> 
          </Switch>
        </div>
        <Footer />
      </Router>     
    </div>
  );
}

export default App;
