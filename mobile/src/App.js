import React from 'react';
import './App.scss';
import {LoginComponent} from "./Login/Login";
import {useAuthorizedUser} from "./authentication";
import Home from "./Home/Home";

function App() {
    const {state} = useAuthorizedUser();
    return (
        <div className="App">
            {state.isLoggedIn ? <Home/> : <LoginComponent/>}
        </div>
    );
}

export default App;
