import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import config from "../../config.json"

function Home() {

    const navigate = useNavigate();

    useEffect(() => {
        navigate(config.urlPath + "/login");
    }, [navigate]);

    return(
        <div>
            <div>Home</div>
        </div>
    );
}

export default Home;