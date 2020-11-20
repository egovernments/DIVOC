import React from 'react';
import {useAuthorizedUser} from "../authentication";
import Button from 'react-bootstrap/Button'
import './Home.scss'
import Card from "react-bootstrap/Card";

Home.propTypes = {};

function Home(props) {
    const {state, logout} = useAuthorizedUser();
    console.log(state);
    return (
        <div className={"home-container"}>
            <Card>
                <Button variant="success" onClick={() => {
                    logout();
                }}>Logout</Button>{' '}
            </Card>
        </div>
    );
}

export default Home;
