import {appIndexDb, ENROLLMENT_TYPES} from "./AppDatabase";
import {ApiServices} from "./Services/ApiServices";
import {programDb} from "./Services/ProgramDB";
import {comorbiditiesDb} from "./Services/ComorbiditiesDB";
import {queueDb} from "./Services/QueueDB";
import {getSelectedProgram, getSelectedProgramId} from "./components/ProgramSelection";
import {CONSTANT} from "./utils/constants";

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
        const preEnrollments = await ApiServices.fetchPreEnrollments();
        await appIndexDb.saveEnrollments(preEnrollments, ENROLLMENT_TYPES.PRE_ENROLLMENT);

        const programs = await ApiServices.fetchPrograms();
        await programDb.savePrograms(programs);
        for (const program of programs) {
            const data = {
                "key": CONSTANT.PROGRAM_COMORBIDITIES_KEY
            }
            await ApiServices.fetchEtcdConfigs(data)
                .catch((err) => {
                    console.log("Error occurred while fetching comorbidity config from etcd");
                    console.log(err)
                })
                .then((res) => {
                    comorbiditiesDb.saveComorbidities(program.id, res)
                })
        }

        const vaccinators = await ApiServices.fetchVaccinators();
        await appIndexDb.saveVaccinators(vaccinators);

        const selectedProgram = getSelectedProgramId();
        const userDetails = await appIndexDb.getUserDetails()
        const facilityId = userDetails["facilityDetails"]["osid"]
        const facilitySchedules = await ApiServices.fetchFacilitySchedule(facilityId)
        await appIndexDb.saveFacilitySchedule(facilitySchedules)

        await queueDb.popData()
    }

    static async push() {
        const certifyPatients = await appIndexDb.getDataForCertification();
        if (certifyPatients.length > 0) {
            const response = await ApiServices.certify(certifyPatients);
            if (response.code) {
                const isSuccess = response.code >= 200 && response.code <= 300;
                if (!isSuccess) {
                    throw new Error("Failed to sync");
                }
            }
        }
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
        await appIndexDb.cleanEvents()
    }


    static async isNotSynced() {
        await appIndexDb.initDb();
        const events = await appIndexDb.getAllEvents();
        return (events && events.length > 0)
    }

    static lastSyncedOn() {
        const lastSyncDate = localStorage.getItem(LAST_SYNC_KEY);
        const lastSyncTime = new Date(lastSyncDate).getTime()
        const currentTime = new Date().getTime()
        return relativeTimeDifference(currentTime, lastSyncTime)
    }
}

function relativeTimeDifference(current, previous) {

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' second(s) ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minute(s) ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hour(s) ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' day(s) ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}
