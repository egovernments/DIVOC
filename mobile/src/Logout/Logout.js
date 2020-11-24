import {useAuthorizedUser} from "../authentication";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import React from "react";
import {BaseCard} from "../Base/Base";
import "./Logout.scss"

export function Logout(props) {
    const {logout} = useAuthorizedUser();
    return (
        <BaseCard>
            <div className={"logout-container"}>
                <Button variant="success" onClick={() => {
                    logout();
                }}>Logout</Button>{' '}
            </div>
        </BaseCard>
    );
}
