import React, {useEffect, useState} from "react";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {formatLoginDate} from "../../utils/date_utils";
import {appIndexDb} from "../../AppDatabase";
import {SyncFacade} from "../../SyncFacade";
import Button from "react-bootstrap/Button";
import {Messages} from "../../Base/Constants";
import {AuthSafeComponent} from "../../utils/keycloak";
import Col from "react-bootstrap/Col";
import config from "../../config";
import {queueDb} from "../../Services/QueueDB";
import {getMessageComponent, LANGUAGE_KEYS, useLocale} from "../../lang/LocaleContext";
import {useOnlineStatus} from "../../utils/offlineStatus";

function AuthSafeUserProfile({keycloak}) {
    const isOnLine = useOnlineStatus()
    const [userDetails, setUserDetails] = useState();
    const {getText} = useLocale();

    useEffect(() => {
        appIndexDb.getUserDetails()
            .then((userDetails) => setUserDetails(userDetails))
            .catch((e) => {
            })

    }, [])


    return (
        <div className="profile-container">
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.PROFILE)}>
                {userDetails && <div>
                    <div className="name mt-4">{userDetails.full_name}</div>
                    <div className="mt-2 mr-2">
                        <Col>
                            <Col>
                                <div
                                    className="subtitle label mt-4">{getMessageComponent(LANGUAGE_KEYS.PROFILE_LAST_LOGGED_IN)}</div>
                                <div className="subtitle date">{formatLoginDate(userDetails.loginTime)}</div>
                            </Col>
                            <Col>
                                <div className="mt-4 d-flex flex-column justify-content-end">
                                    <div
                                        className="subtitle label">{getMessageComponent(LANGUAGE_KEYS.PROFILE_LAST_SYNC)}</div>
                                    <div className="subtitle date">{SyncFacade.lastSyncedOn()}</div>
                                </div>
                            </Col>
                        </Col>
                    </div>
                    <hr className="mt-4 mb-4"/>
                    <div>
                        <div className="name">{getMessageComponent(LANGUAGE_KEYS.PROFILE_FACILITY)}</div>
                        <div className="mt-2">{userDetails.facilityDetails.facilityName}</div>
                        <div
                            className="subtitle mt-1">{userDetails.facilityDetails.address.addressLine1}{userDetails.facilityDetails.address.district ? "," : ""} {userDetails.facilityDetails.address.district}</div>
                        <div
                            className="subtitle">{userDetails.facilityDetails.address.state} {userDetails.facilityDetails.address.pincode}</div>
                    </div>
                    <div className="logout-container mt-5 d-flex justify-content-around">
                        <Button variant="outline-danger" onClick={() => {
                            const message = getText(LANGUAGE_KEYS.PROFILE_CONFIRM_LOGOUT_MESSAGE)
                            const isConfirmed = window.confirm(message);
                            if (isConfirmed) {
                                if (isOnLine) {
                                    SyncFacade
                                        .push()
                                        .catch((e) => console.log(e.message))
                                        .then(() => queueDb.stashData())
                                        .then(() => appIndexDb.clearEverything())
                                        .then((() => keycloak.logout({redirectUri: window.location.origin + config.urlPath})))
                                        .catch(e => {
                                            console.log(e.message)
                                            if (!isOnLine) {
                                                alert(Messages.NO_INTERNET_CONNECTION)
                                            }
                                        })
                                } else {
                                    alert(Messages.NO_INTERNET_CONNECTION)
                                }
                            }
                        }}>{getMessageComponent(LANGUAGE_KEYS.LOGOUT)}</Button>{" "}
                    </div>
                </div>}
            </BaseFormCard>
        </div>
    )
}

export function UserProfile(props) {
    return (
        <AuthSafeComponent>
            <AuthSafeUserProfile/>
        </AuthSafeComponent>
    );
}
