import React, {useEffect, useState} from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {useKeycloak} from "@react-keycloak/web";
import {SyncFacade} from "./SyncFacade";
import config from "./config"

function App() {
    const {keycloak, initialized} = useKeycloak();
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
                    keycloak.login({redirectUri:config.urlPath})
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

export default App;
