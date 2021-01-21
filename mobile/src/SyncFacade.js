import {appIndexDb} from "./AppDatabase";
import {ApiServices} from "./Services/ApiServices";

export class SyncFacade {

    static async pull() {
        await appIndexDb.initDb();
        const vaccinators = await ApiServices.fetchVaccinators();
        await appIndexDb.saveVaccinators(vaccinators);
        const preEnrollments = await ApiServices.fetchPreEnrollments();
        await appIndexDb.saveEnrollments(preEnrollments);
    }

    static async push() {
        const certifyPatients = await appIndexDb.getDataForCertification();
        if (certifyPatients.length > 0) {
            await ApiServices.certify(certifyPatients);
        }
        await appIndexDb.cleanUp()
    }
}
