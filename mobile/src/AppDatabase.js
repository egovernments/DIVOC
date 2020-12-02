import {openDB} from "idb";

const DATABASE_NAME = "DivocDB"
const DATABASE_VERSION = 5
const PATIENTS = "patients";
const QUEUE = "queue";
const EVENTS = "events";
const VACCINATORS = "vaccinators";
const STATUS = "status";

export const QUEUE_STATUS = Object.freeze({"IN_QUEUE": "in_queue", "COMPLETED": "completed"})

export class AppDatabase {

    async initDb() {
        if (this.db) {
            return this.db;
        }
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade(db) {
                db.createObjectStore(PATIENTS, {keyPath: "code"});
                db.createObjectStore(QUEUE, {keyPath: "code"});
                db.createObjectStore(VACCINATORS, {keyPath: "osid"});
                db.createObjectStore(EVENTS, {keyPath: "id", autoIncrement: true});
            }
        });
        this.db = db;
        return db;
    }

    async addToQueue(patients) {
        patients.status = QUEUE_STATUS.IN_QUEUE
        patients.code = patients.enrollCode
        return this.db.add(QUEUE, patients);
    }

    async getPatientDetails(enrollCode) {
        return this.db.get(PATIENTS, enrollCode);
    }

    async recipientDetails() {
        let waiting = 0;
        let issue = 0;
        const result = await this.db.getAll(QUEUE)
        result.forEach((item) => {
            if (item[STATUS] === QUEUE_STATUS.IN_QUEUE) {
                waiting++;
            } else if (item[STATUS] === QUEUE_STATUS.COMPLETED) {
                issue++;
            }
        })

        return [
            {title: "Recipient Waiting", value: waiting},
            {title: "Certificate Issued", value: issue},
        ];
    }

    async getQueue(status) {
        if (status) {
            const result = await this.db.getAll(QUEUE)
            const filter = result.filter((item) => item[STATUS] === status)
            return Promise.resolve(filter)
        } else {
            return this.db.getAll(QUEUE)
        }
    }

    async getVaccinators() {
        return this.db.getAll(VACCINATORS)
    }

    async markPatientAsComplete(enrollCode) {
        const patient = await this.db.get(QUEUE, enrollCode)
        patient.status = QUEUE_STATUS.COMPLETED
        return this.db.put(QUEUE, patient)
    }

    async saveEvent(event) {
        return this.db.add(EVENTS, event)
    }

    async saveEnrollments(enrollments) {
        const enrollmentsList = enrollments || []
        const patients = enrollmentsList.map((item, index) => this.db.put(PATIENTS, item));
        return Promise.all(patients)
    }

    async saveVaccinators(vaccinators) {
        const vaccinatorList = vaccinators || []
        const vaccinatorsDb = vaccinatorList.map((item, index) => this.db.put(VACCINATORS, item));
        return Promise.all(vaccinatorsDb)
    }

}

export const appIndexDb = new AppDatabase()


