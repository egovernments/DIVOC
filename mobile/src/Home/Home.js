import React from 'react';
import {useAuthorizedUser} from "../authentication";
import Button from 'react-bootstrap/Button'
import './Home.scss'

Home.propTypes = {};

function Home(props) {
    const {state, logout} = useAuthorizedUser();
    console.log(state);
    return (
        <div className={"home-container"}>
            <Button variant="success" onClick={() => {
                logout();
            }}>Logout</Button>{' '}
        </div>
    );
}

export default Home;
