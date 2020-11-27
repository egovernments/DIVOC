import React from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {useKeycloak} from "@react-keycloak/web";

function App() {
    const {initialized} = useKeycloak();
    if (!initialized) {
        return <div>Loading...</div>
    }
    return (
        <div className="App">
            <Dashboard/>
        </div>
    );
}

export default App;
