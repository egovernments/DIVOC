import React, {useEffect, useState} from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {useKeycloak} from "@react-keycloak/web";
import {appIndexDb} from "./AppDatabase";
import {ApiServices} from "./Services/apiServices";

function App() {
    const {keycloak, initialized} = useKeycloak();
    const [isDBInit, setDBInit] = useState(false);
    useEffect(() => {
        if (initialized) {
            appIndexDb.initDb().then((value => {
                return ApiServices.fetchVaccinators()
            })).then((value => {
                return appIndexDb.saveVaccinators(value)
            })).then(() => {
                return ApiServices.fetchPreEnrollments()
            }).then((value => {
                return appIndexDb.saveEnrollments(value)
            })).then(value => {
                setDBInit(true)
            }).catch((e) => {
                setDBInit(true)
            });
        }
    }, [initialized])
    if (!initialized || !isDBInit) {
        return <div>Loading...</div>
    }

    localStorage.setItem("token", keycloak.token)

    return (
        <div className="App">
            <Dashboard/>
        </div>
    );
}

export default App;
