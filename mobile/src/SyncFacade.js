import {appIndexDb} from "./AppDatabase";
import {ApiServices} from "./Services/ApiServices";

const LAST_SYNC_KEY = "lastSyncedDate";

export const is24hoursAgo = (date) => {

    const numberOfDays = 1
    // ---------------------- day hour  min  sec  msec
    const oneDayIntoMillis = numberOfDays * 24 * 60 * 60 * 1000
    const currentDateInMillis = new Date().getTime()
    const oneDayDiff = currentDateInMillis - date.getTime();
    return oneDayDiff >= oneDayIntoMillis
}

export class SyncFacade {

    static async pull() {
        await appIndexDb.initDb();
        const vaccinators = await ApiServices.fetchVaccinators();
        await appIndexDb.saveVaccinators(vaccinators);
        const preEnrollments = await ApiServices.fetchPreEnrollments();
        await appIndexDb.saveEnrollments(preEnrollments);
        const userDetails = await ApiServices.getUserDetails();
        await appIndexDb.saveUserDetails(userDetails);

    }

    static async push() {
        const certifyPatients = await appIndexDb.getDataForCertification();
        if (certifyPatients.length > 0) {
            await ApiServices.certify(certifyPatients);
        }
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
        await appIndexDb.cleanUp()
    }


    static async isSyncedIn24Hours() {
        await appIndexDb.initDb();
        const events = await appIndexDb.getAllEvents();
        console.log(events)
        if (events) {
            if (events.length && events.length > 0) {
                const lastSyncedDate = localStorage.getItem(LAST_SYNC_KEY);
                const date = new Date(lastSyncedDate)
                return is24hoursAgo(date)
            }
        }
        return false;
    }
}
