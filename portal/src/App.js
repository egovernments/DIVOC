import './App.css';
import logo from './logo.svg';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Home from './components/Home'
import About from './components/About'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import VaccineRegistration from './components/VaccineRegistration/VaccineRegistration';

export default function App() {
    return (
        <div>
          <div><img src={logo}></img></div>
            <Router>
                <div>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/about">What is DIVOC?</Link></li>
                    </ul>

                    <hr/>

                    {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
                    <Switch>
                        <Route exact path="/">
                            <Home/>
                        </Route>
                        <Route path="/login"><Login/></Route>
                        <Route path="/dashboard"><Dashboard/></Route>
                        <Route path="/about"><About/></Route>
                        <Route path="/admin"><VaccineRegistration/></Route>
                    </Switch>
                </div>
            </Router>
        </div>
    );
}