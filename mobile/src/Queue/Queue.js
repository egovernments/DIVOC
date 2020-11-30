import React from "react";
import {BaseCard} from "../Base/Base";
import "./Queue.scss"

export function Queue(props) {
    return (
        <BaseCard>
            <div className={"queue-container"}>
                <h1 className={"title"}>Queue</h1>
            </div>
        </BaseCard>
    );
}
