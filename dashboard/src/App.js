import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from '../src/components/Header/Header';
import Home from '../src/components/Home/Home';
import "./App.css";

function App() {
    return (
        <div className="App">
            <Header />
            <Router>
                <Switch>
                    <Route component={Home} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
