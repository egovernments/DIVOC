import React from "react";
import {BaseCard} from "../Base/Base";
import "./Language.scss"

export function SelectLanguage(props) {
    return (
        <BaseCard>
            <div className={"language-container"}>
                <h1 className={"title"}>Select Language</h1>
            </div>
        </BaseCard>
    );

}
