import React, {useEffect, useState} from "react";
import "./Queue.scss"
import {RecipientQueueTable} from "../components/RecipientQueueTable";
import {InfoCard} from "../components/InfoCard";
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
                {recipientDetails.map((item, index) => <InfoCard key={item.titleKey} metric={item.value}
                                                                 title={getMessageComponent(item.titleKey)}/>)}
            </div>
        </div>
    );
}


