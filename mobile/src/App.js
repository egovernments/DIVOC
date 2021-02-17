import React, {useEffect, useState} from 'react';
import './App.scss';
import Dashboard from "./Dashboard/Dashboard";
import {ReactKeycloakProvider} from "@react-keycloak/web";
import {SyncFacade} from "./SyncFacade";
import config from "./config"
import keycloak, {AuthSafeComponent} from "./utils/keycloak";
import {LocaleProvider} from "./lang/LocaleContext";
import {useOnlineStatus} from "./utils/offlineStatus";
import {getSelectedProgram, SelectProgram} from "./components/ProgramSelection";
import {store} from "../src/redux/store";
import {Provider} from "react-redux";
import {storeApplicationConfigFromFlagr} from "./redux/reducers/flagrConfig";
import {CONSTANT} from "./utils/constants";

function App({keycloak, initialized}) {
    const [isDBInit, setDBInit] = useState(false);
    const [programSelected, setProgramSelected] = useState(getSelectedProgram())
    useEffect(() => {
        if (initialized) {
            if (keycloak.authenticated) {
                if (!keycloak.hasResourceRole(CONSTANT.FACILITY_STAFF_ROLE, CONSTANT.PORTAL_CLIENT)) {
                    alert("Unauthorized. Contact ADMIN");
                    keycloak.logout({redirectUri: window.location.origin + config.urlPath});
                } else {
                    localStorage.setItem("token", keycloak.token);
                    SyncFacade.pull().then(value => {
                        setDBInit(true)
                    }).catch((e) => {
                        console.log(e);
                        setDBInit(true)
                    });
                }
            } else {
                if (!keycloak.authenticated) {
                    keycloak.login({redirectUri: window.location.origin + config.urlPath})
                }
            }
            storeApplicationConfigFromFlagr(store.dispatch)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized]);

    if (!initialized || !isDBInit) {
        return <div>Loading...</div>
    }
    const onDone = (name) => {
        setProgramSelected(name)
    }

    return (
        <div className="App">
            {programSelected ? <Dashboard/> : <SelectProgram onDone={onDone}/>}
        </div>
    );
}

export function FacilityApp() {
    const isOnline = useOnlineStatus();

    if (isOnline) {
        return <Provider store={store}>
            <ReactKeycloakProvider
                authClient={keycloak}
                initOptions={{"checkLoginIframe": false}}>
                <LocaleProvider>
                    <AuthSafeComponent>
                        <App/>
                    </AuthSafeComponent>
                </LocaleProvider>
            </ReactKeycloakProvider>
        </Provider>
    } else {
        return (
            <Provider store={store}>
                <LocaleProvider>
                    <AuthSafeComponent>
                        <App/>
                    </AuthSafeComponent>
                </LocaleProvider>
            </Provider>
        );
    }
}

export default App;
