import React, {useEffect, useState} from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {ReactKeycloakProvider} from "@react-keycloak/web";
import {SyncFacade} from "./SyncFacade";
import config from "./config"
import keycloak, {AuthSafeComponent} from "./utils/keycloak";
import {LocaleProvider} from "./lang/LocaleContext";

function App({keycloak, initialized}) {
    const [isDBInit, setDBInit] = useState(false);
    useEffect(() => {
        if (initialized) {
            if (keycloak.authenticated) {
                localStorage.setItem("token", keycloak.token);
                SyncFacade.pull().then(value => {
                    setDBInit(true)
                }).catch((e) => {
                    console.log(e);
                    setDBInit(true)
                });
            } else {
                if (!keycloak.authenticated) {
                    keycloak.login({redirectUri: config.urlPath})
                }
            }
        }
    }, [initialized]);
    if (!initialized || !isDBInit) {
        return <div>Loading...</div>
    }


    return (
        <div className="App">
            <Dashboard/>
        </div>
    );
}

export function FacilityApp() {
    const isOnline = navigator.onLine
    if (isOnline) {
        return <ReactKeycloakProvider
            authClient={keycloak}
            initOptions={{"checkLoginIframe": false}}>
            <LocaleProvider>
                <AuthSafeComponent>
                    <App/>
                </AuthSafeComponent>
            </LocaleProvider>
        </ReactKeycloakProvider>
    } else {
        return (
            <LocaleProvider>
                <AuthSafeComponent>
                    <App/>
                </AuthSafeComponent>
            </LocaleProvider>
        );
    }
}

export default App;
