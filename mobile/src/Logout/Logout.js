import Button from "react-bootstrap/Button";
import React from "react";
import {BaseCard} from "../Base/Base";
import "./Logout.scss"
import {appIndexDb} from "../AppDatabase";
import {SyncFacade} from "../SyncFacade";
import {useKeycloak} from "@react-keycloak/web";
import * as PropTypes from "prop-types";
import {AuthSafeComponent} from "../utils/keycloak";

function AuthSafeLogout({keycloak}) {
    return <BaseCard>
        <div className={"logout-container"}>
            <Button variant="success" onClick={() => {
                SyncFacade
                    .push()
                    .then(() => appIndexDb.clearEverything())
                    .then((value => {
                        keycloak.logout();
                    }))
            }}>Logout</Button>{" "}
        </div>
    </BaseCard>;
}

AuthSafeLogout.propTypes = {onClick: PropTypes.func};

export function Logout(props) {
    return (
        <AuthSafeComponent>
            <AuthSafeLogout/>
        </AuthSafeComponent>
    );
}
