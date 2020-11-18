import React from 'react';
import PropTypes from 'prop-types';
import {useLogin} from "../Login/Login";
import {useAuthorizedUser} from "../authentication";
import {Button} from "react-bootstrap";

Home.propTypes = {};

function Home(props) {
    const {state, logout} = useAuthorizedUser();
    console.log(state);
    return (
        <div>
            <Button onClick={() => {
                logout();
            }}>Logout</Button>
        </div>
    );
}

export default Home;
