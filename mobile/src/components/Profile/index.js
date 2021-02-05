import React, {useEffect, useState} from "react";
import {BaseFormCard} from "../BaseFormCard";
import "./index.scss"
import {formatLoginDate} from "../../utils/date_utils";
import {appIndexDb} from "../../AppDatabase";
import {SyncFacade} from "../../SyncFacade";
import Button from "react-bootstrap/Button";
import {Messages} from "../../Base/Constants";
import {AuthSafeComponent} from "../../utils/keycloak";

function AuthSafeUserProfile({keycloak}) {
    const [userDetails, setUserDetails] = useState();

    useEffect(() => {
        appIndexDb.getUserDetails()
            .then((userDetails) => setUserDetails(userDetails))
            .catch((e) => {
            })

    }, [])


    return (
        <div className="profile-container">
            <BaseFormCard title="Profile">
                {userDetails && <div>
                    <div>
                        <div>{userDetails.full_name}</div>
                    </div>
                    <div className="mr-2 d-flex flex-column justify-content-end">
                        <div className="subtitle label">Last logged in</div>
                        <div className="subtitle date">{formatLoginDate(userDetails.loginTime)}</div>
                        <div className="subtitle label">Last sync in</div>
                        <div className="subtitle date">{SyncFacade.lastSyncedOn()}</div>
                    </div>
                    <hr/>
                    <div>
                        <div>Facility Center</div>
                        <div className="ml-3 m-2">
                            <div className="name">{userDetails.facilityDetails.facilityName}</div>
                            <div
                                className="subtitle">{userDetails.facilityDetails.address.addressLine1},{userDetails.facilityDetails.address.district}</div>
                            <div
                                className="subtitle">{userDetails.facilityDetails.address.state} {userDetails.facilityDetails.address.pincode}</div>
                        </div>
                    </div>

                    <Button variant="success" onClick={() => {
                        if (navigator.onLine) {
                            SyncFacade
                                .push()
                                .catch((e) => console.log(e.message))
                                .then(() => appIndexDb.clearEverything())
                                .then((() => keycloak.logout()))
                                .catch(e => {
                                    console.log(e.message)
                                    if (!navigator.onLine) {
                                        alert(Messages.NO_INTERNET_CONNECTION)
                                    }
                                })
                        } else {
                            alert(Messages.NO_INTERNET_CONNECTION)
                        }
                    }}>Confirm Logout ?</Button>{" "}

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
