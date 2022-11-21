import React from "react";
import LoadingImg from "../../assets/img/loading.gif";
import "./index.css";

export const Loader = () => {
    return (
        <div className="loader-wrapper">
            <img src={LoadingImg}/>

        </div>
    )
};