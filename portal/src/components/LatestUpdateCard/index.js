import React from "react";
import "./index.css";

export const LatestUpdateCard = () => (
    <div className="d-flex flex-row m-3 p-3 update-card">
        <div className="d-flex flex-column align-items-center">
            <span className="card-date font-weight-bold">13</span>
            <span className="card-author">Oct</span>
        </div>
        <div className="d-flex flex-column pl-5 pr-5">
            <span className="card-author">Author or update from</span>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor ...</span>
            <a href="/" className="pt-3 d-flex align-items-center">Read More <span className="pl-1" style={{fontSize: '30px'}}> > </span></a>
        </div>
    </div>
);