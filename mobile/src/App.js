import React, {useEffect, useState} from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {useKeycloak} from "@react-keycloak/web";
import {SyncFacade} from "./SyncFacade";

function App() {
    const {keycloak, initialized} = useKeycloak();
    const [isDBInit, setDBInit] = useState(false);
    useEffect(() => {
        if (initialized) {
            localStorage.setItem("token", keycloak.token)
            SyncFacade.pull().then(value => {
                setDBInit(true)
            }).catch((e) => {
                setDBInit(true)
            });
        }
    }, [initialized])
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
