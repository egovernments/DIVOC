import {openDB} from "idb";
import {LANGUAGE_KEYS} from "./lang/LocaleContext";

const DATABASE_NAME = "DivocDB";
const DATABASE_VERSION = 6;
const PATIENTS = "patients";
const QUEUE = "queue";
const EVENTS = "events";
const VACCINATORS = "vaccinators";
const STATUS = "status";
const USER_DETAILS = "user_details";
const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

export const QUEUE_STATUS = Object.freeze({IN_QUEUE: "in_queue", COMPLETED: "completed"});

export class AppDatabase {

    async initDb() {
        if (this.db) {
            return this.db;
        }
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade(db, oldVersion, newVersion) {
                debugger
                if (oldVersion === 0 || newVersion === 5) {
                    db.createObjectStore(PATIENTS, {keyPath: "code"});
                    db.createObjectStore(QUEUE, {keyPath: "code"});
                    db.createObjectStore(VACCINATORS, {keyPath: "osid"});
                    db.createObjectStore(EVENTS, {keyPath: "id", autoIncrement: true});
                }
                if (oldVersion === 0 || newVersion === 6) {
                    db.createObjectStore(USER_DETAILS);
                }
            }
        });
        this.db = db;
        return db;
    }

    async addToQueue(patients) {
        patients.status = QUEUE_STATUS.IN_QUEUE;
        patients.code = patients.enrollCode;
        return this.db.put(QUEUE, patients);
    }

    async getPatientDetails(enrollCode, mobileNumber) {
        const patient = await this.db.get(PATIENTS, enrollCode);
        if (patient) {
            if (patient.phone === mobileNumber) {
                patient.dob = this.formatDate(patient.dob)
                return patient
            } else {
                return null;
            }
        }
        return patient;
    }

    formatDate(givenDate) {
        const dob = new Date(givenDate)
        let day = dob.getDate();
        let monthName = monthNames[dob.getMonth()];
        let year = dob.getFullYear();

        return `${day}/${monthName}/${year}`;
    }

    async recipientDetails() {
        let waiting = 0;
        let issue = 0;
        const result = await this.db.getAll(QUEUE);
        result.forEach((item) => {
            if (item[STATUS] === QUEUE_STATUS.IN_QUEUE) {
                waiting++;
            } else if (item[STATUS] === QUEUE_STATUS.COMPLETED) {
                issue++;
            }
        });

        return [
            {titleKey: LANGUAGE_KEYS.RECIPIENT_WAITING, value: waiting},
            {titleKey: LANGUAGE_KEYS.CERTIFICATE_ISSUED, value: issue},
        ];
    }

    async getQueue(status) {
        if (status) {
            const result = await this.db.getAll(QUEUE);
            const filter = result.filter((item) => item[STATUS] === status);
            return Promise.resolve(filter)
        } else {
            return this.db.getAll(QUEUE)
        }
    }

    async getVaccinators() {
        return this.db.getAll(VACCINATORS)
    }

    async markPatientAsComplete(enrollCode) {
        const patient = await this.db.get(QUEUE, enrollCode);
        patient.status = QUEUE_STATUS.COMPLETED;
        return this.db.put(QUEUE, patient)
    }

    async saveEvent(event) {
        return this.db.add(EVENTS, event)
    }

    async saveUserDetails(userDetails) {
        return this.db.put(USER_DETAILS, userDetails, USER_DETAILS);
    }

    async getUserDetails() {
        return this.db.get(USER_DETAILS, USER_DETAILS);
    }

    async saveEnrollments(enrollments) {
        const enrollmentsList = enrollments || [];
        const patients = enrollmentsList.map((item, index) => this.db.put(PATIENTS, item));
        return Promise.all(patients)
    }

    async saveVaccinators(vaccinators) {
        const vaccinatorList = vaccinators || [];
        const vaccinatorsDb = vaccinatorList.map((item, index) => this.db.put(VACCINATORS, item));
        return Promise.all(vaccinatorsDb)
    }

    async getDataForCertification() {
        const events = await this.db.getAll(EVENTS) || [];
        const certifyObjects = events.map((item, index) => this.getCertifyObject(item));
        const result = await Promise.all(certifyObjects);
        return result;
    }

    async getCertifyObject(event) {
        const patient = await this.db.get(PATIENTS, event.enrollCode);
        const vaccinator = await this.db.get(VACCINATORS, event.vaccinatorId);
        const queue = await this.db.get(QUEUE, event.enrollCode);
        return {
            vaccinator: vaccinator,
            patient: patient,
            batchCode: event.batchCode,
            enrollCode: event.enrollCode,
            identify: queue.aadhaarNumber
        }
    }

    async cleanUp() {
        await this.db.clear(EVENTS)
    }

    async clearEverything() {
        const deletePatients = this.db.clear(PATIENTS);
        const deleteVaccinators = this.db.clear(VACCINATORS);
        const deleteEvents = await this.db.clear(EVENTS);
        const deleteQueue = await this.db.clear(QUEUE);
        return Promise.all([deleteEvents, deletePatients, deleteQueue, deleteVaccinators])
    }

}

export const appIndexDb = new AppDatabase();


