import React, {useEffect, useState} from "react";
import "./Queue.scss"
import {RecipientQueueTable} from "../components/RecipientQueueTable";
import {InfoCard} from "../components/InfoCard";
import {Link} from "react-router-dom";
import {appIndexDb} from "../AppDatabase";
import {getMessageComponent} from "../lang/LocaleContext";

export function Queue(props) {
    const [recipientDetails, setRecipientDetails] = useState([])
    useEffect(() => {
        appIndexDb.recipientDetails().then((result) => setRecipientDetails(result))
    }, [])
    return (
        <div className="queue-container">
            <RecipientQueueTable/>
            <div className="d-flex justify-content-between mt-2">
                {recipientDetails.map((item, index) => <InfoCard metric={item.value} title={getMessageComponent(item.titleKey)}/>)}
            </div>
            <Link className="mt-2 d-block verify-btn" to={"/"}>{"VERIFY NEXT RECIPIENT"}</Link>
        </div>
    );
}


