import {BaseCard} from "../Base/Base";
import React from "react";
import "./Home.scss"

export function Home(props) {
    return (
        <BaseCard>
            <div className={"home-container"}>
                <h1 className={"title"}>Home</h1>
            </div>
        </BaseCard>
    );
}
