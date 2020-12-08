import React from "react";
import {Link} from "react-router-dom";
import config from "../../config";

export const Home = () => (
    <div className="main-container">
        <Link to={config.urlPath + "/"}>Download Certificate</Link>
        <br/>
        <Link to={"/side_effects"}>Side Effects</Link>
    </div>
);