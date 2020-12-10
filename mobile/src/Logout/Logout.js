import Button from "react-bootstrap/Button";
import React from "react";
import {BaseCard} from "../Base/Base";
import "./Logout.scss"
import {useKeycloak} from "@react-keycloak/web";
import {appIndexDb} from "../AppDatabase";
import {SyncFacade} from "../SyncFacade";

export function Logout(props) {
    const {keycloak} = useKeycloak();

    return (
        <BaseCard>
            <div className={"logout-container"}>
                <Button variant="success" onClick={() => {
                    SyncFacade
                        .push()
                        .then(() => appIndexDb.clearEverything())
                        .then((value => {
                            keycloak.logout();
                        }))
                }}>Logout</Button>{' '}
            </div>
        </BaseCard>
    );
}
