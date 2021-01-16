import Keycloak from 'keycloak-js';
import config from "../config"
import React from "react";
import {useKeycloak} from "@react-keycloak/web";
import {Messages} from "../Base/Constants";

const keycloak = Keycloak(config.urlPath + '/keycloak.json');

export default keycloak

export function AuthSafeComponent({children}) {
    const isOnline = navigator.onLine
    if (isOnline) {
        return <WithKeyCloakComponent children={children}/>
    } else {
        return <WithoutKeyCloakComponent children={children}/>
    }
}

export function WithKeyCloakComponent({children}) {
    const {keycloak, initialized} = useKeycloak()
    if (!keycloak || !children) {
        return <div>
            Loading...
        </div>
    }
    if (navigator.onLine) {
        return React.cloneElement(
            children,
            {initialized: initialized, keycloak: keycloak}
        )
    } else {
        return React.cloneElement(
            children,
            {
                initialized: true,
                keycloak: {
                    authenticated: true,
                    login: function (path) {

                    },
                    hasResourceRole: function () {
                        return true
                    },
                    token: localStorage.getItem("token")
                }
            }
        )
    }
}

export function WithoutKeyCloakComponent({children}) {
    if (!children) {
        return <div>
            Loading...
        </div>
    }
    const token = localStorage.getItem("token")
    if (!token) {
        return <div>Failed to Login. Please by re-login again</div>
    }
    return React.cloneElement(
        children,
        {
            initialized: true,
            keycloak: {
                authenticated: true,
                login: function (path) {
                    alert(Messages.NO_INTERNET_CONNECTION)
                },
                logout: function () {
                    alert(Messages.NO_INTERNET_CONNECTION)
                },
                hasResourceRole: function () {
                    return true
                },
                token: localStorage.getItem("token")
            }
        }
    )
}
