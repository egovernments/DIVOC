import React from "react";

export function TextInCenter({text}) {
    return (
        <div style={{height: "75%", width: "100%", display: "grid", placeItems: "center"}}>
            <div style={{textAlign: "center"}}>
                {text}
            </div>
        </div>
    )
}
