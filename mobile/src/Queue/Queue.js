import React from "react";
import "./Queue.scss"
import {RecipientQueueTable} from "../components/RecipientQueueTable";
import {InfoCard} from "../components/InfoCard";
import {Link} from "react-router-dom";

export function Queue(props) {

    return (
        <div className="queue-container">
            <RecipientQueueTable/>
            <div className="d-flex justify-content-between mt-2">
                <InfoCard metric={52} title={"Recipient Waiting"}/>
                <InfoCard metric={52} title={"Certificates Issued"}/>
            </div>
            <Link className="mt-2 d-block verify-btn" to={"/"}>{"VERIFY NEXT RECIPIENT"}</Link>
        </div>
    );
}


