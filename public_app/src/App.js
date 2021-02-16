import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import Header from '../src/components/Header/Header';
import Footer from '../src/components/Footer/Footer';
import {PrivateRoute} from "./utils/PrivateRoute";
import {useKeycloak} from "@react-keycloak/web";
import Login from './components/Login';
import CertificateView from './components/CertificateView/CertificateView';
import config from "./config"
import {Home} from "./components/Home";
import {SideEffects} from "./components/SideEffects";
import Dashboard from "./components/Dashboard";
import {VerifyCertificate} from "./components/VerifyCertificate";
import {Provider} from "react-redux";
import {store} from "./redux/store";
import Learn from "./components/Learn";
import {RECIPIENT_CLIENT_ID, RECIPIENT_ROLE} from "./constants";
import {SubmitSymptomsForm} from "./components/SubmitSymptomsForm";
import {Members} from "./components/Registration/Members";

function App() {
    const {initialized, keycloak} = useKeycloak();

    if (!initialized) {
        return <div>Loading...</div>
    }
    return (
        <Provider store={store}>
            <div className={""}>
                <Router>
                    <Header/>
                    <div style={{paddingBottom: "6rem", paddingTop: "3rem"}}>
                        <Switch>
                            <Route exact path={"/"} component={Home}/>
                            <Route exact path={config.urlPath + "/login"} component={Login}/>
                            <Route exact path={"/side-effects"} component={SideEffects}/>
                            <Route exact path={"/feedback"} component={SideEffects}/>
                            <PrivateRoute exact path={"/feedback/verify"} component={SubmitSymptomsForm} role={RECIPIENT_ROLE} clientId={RECIPIENT_CLIENT_ID}/>
                            <Route exact path={"/dashboard"} component={Dashboard}/>
                            <Route exact path={"/verify-certificate"} component={VerifyCertificate}/>
                            <Route exact path={"/learn"} component={Learn}/>
                            <PrivateRoute exact path={config.urlPath + "/"} component={CertificateView}
                                          role={RECIPIENT_ROLE} clientId={RECIPIENT_CLIENT_ID}
                            />
                            <PrivateRoute exact path={"/registration"} component={Members} role={RECIPIENT_ROLE} clientId={RECIPIENT_CLIENT_ID}/>
                        </Switch>
                    </div>
                    <Footer/>
                </Router>
            </div>
        </Provider>
    );
}

export default App;
