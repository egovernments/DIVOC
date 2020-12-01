import React, {useEffect, useState} from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {useKeycloak} from "@react-keycloak/web";
import {appIndexDb} from "./AppDatabase";

function App() {
    const {initialized} = useKeycloak();
    const [isDBInit, setDBInit] = useState(false);
    useEffect(() => {
        appIndexDb.initDb().then(() => {
            setDBInit(true)
        })
    }, [])
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
