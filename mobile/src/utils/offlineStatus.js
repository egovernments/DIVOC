import * as _ from 'lodash'

const CONNECTIVITY_SWITCH_WAITING_TIME = 30000;
const {useState, useEffect} = require("react");

function getOnlineStatus() {
    return typeof navigator !== "undefined" &&
    typeof navigator.onLine === "boolean"
        ? navigator.onLine
        : true;
}

export function useOnlineStatus() {
    const [onlineStatus, setOnlineStatus] = useState(getOnlineStatus());

    const goOnline = () => {
        console.log("Othaaa")
        setOnlineStatus(true);
    }

    const goOffline = () => setOnlineStatus(false);

    useEffect(() => {
        const throttleOnline = _.throttle(goOnline, CONNECTIVITY_SWITCH_WAITING_TIME, { 'leading': false });
        const throttleOffline = _.throttle(goOffline, CONNECTIVITY_SWITCH_WAITING_TIME, { 'leading': false });
        window.addEventListener("online", throttleOnline);
        window.addEventListener("offline", throttleOffline);

        return () => {
            window.removeEventListener("online", throttleOnline);
            window.removeEventListener("offline", throttleOffline);
        };
    }, []);

    return onlineStatus;
}
