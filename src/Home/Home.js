import React from 'react';
import PropTypes from 'prop-types';
import {useLogin} from "../Login/Login";

Home.propTypes = {};

function Home(props) {
    const {state} = useLogin();
    console.log(state);
    return (
        <div>
            Home
        </div>
    );
}

export default Home;
