import Button from "react-bootstrap/Button";
import React from "react";
import {BaseCard} from "../Base/Base";
import "./Logout.scss"
import {appIndexDb} from "../AppDatabase";
import {SyncFacade} from "../SyncFacade";
import {useKeycloak} from "@react-keycloak/web";
import * as PropTypes from "prop-types";
import {AuthSafeComponent} from "../utils/keycloak";
import {Messages} from "../Base/Constants";

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
                    .catch(e => {
                        if (!navigator.onLine) {
                            alert(Messages.NO_INTERNET_CONNECTION)
                        }
                    })
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
