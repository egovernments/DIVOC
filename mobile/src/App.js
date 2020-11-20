import React from 'react';
import './App.scss';
import {LoginComponent} from "./Login/Login";
import {useAuthorizedUser} from "./authentication";
import Dashboard from "./Dashboard/Dashboard";

function App() {
    const {state} = useAuthorizedUser();
    return (
        <div className="App">
            {state.isLoggedIn ? <Dashboard/> : <LoginComponent/>}
        </div>
    );
}

export default App;
