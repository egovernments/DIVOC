import React from 'react';
import Header from '../src/components/Header/Header';
import NavigationToolbar from './components/NavigationToolbar/NavigationToolbar';
import "./App.css";

function App() {
    return (
        <div className="App">
            <Header />
            <NavigationToolbar />
        </div>
    );
}

export default App;
