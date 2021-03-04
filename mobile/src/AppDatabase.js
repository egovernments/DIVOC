import {openDB} from "idb";
import {LANGUAGE_KEYS} from "./lang/LocaleContext";
import {getSelectedProgram} from "./components/ProgramSelection";
import {programDb} from "./Services/ProgramDB";
import {monthNames} from "./utils/date_utils";

const DATABASE_NAME = "DivocDB";
const DATABASE_VERSION = 12;
const PATIENTS = "patients";
const PROGRAMS = "programs";
const QUEUE = "queue";
const STASH_DATA = "stash_data";
const EVENTS = "events";
const VACCINATORS = "vaccinators";
const STATUS = "status";
const USER_DETAILS = "user_details";

const PROGRAM_ID = "programId";

export const QUEUE_STATUS = Object.freeze({IN_QUEUE: "in_queue", COMPLETED: "completed"});

export class AppDatabase {

    async initDb() {
        if (this.db) {
            return this.db;
        }
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade(database, oldVersion, newVersion) {
                const objectNames = database.objectStoreNames;

                if (!objectNames.contains(PATIENTS)) {
                    database.createObjectStore(PATIENTS, {keyPath: "code"});
                }

                if (!objectNames.contains(QUEUE)) {
                    database.createObjectStore(QUEUE, {keyPath: "code"});
                }

                if (!objectNames.contains(VACCINATORS)) {
                    database.createObjectStore(VACCINATORS, {keyPath: "osid"});
                }

                if (!objectNames.contains(EVENTS)) {
                    database.createObjectStore(EVENTS, {keyPath: "id", autoIncrement: true});
                }

                if (!objectNames.contains(USER_DETAILS)) {
                    database.createObjectStore(USER_DETAILS);
                }

                if (!objectNames.contains(PROGRAMS)) {
                    database.createObjectStore(PROGRAMS, {keyPath: "name"});
                }

                if (!objectNames.contains(STASH_DATA)) {
                    database.createObjectStore(STASH_DATA, {keyPath: "userId"});
                }
                console.log("DB upgraded from " + oldVersion + " to " + newVersion)
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
        const inQueue = await this.db.get(QUEUE, enrollCode);
        if (patient && !inQueue) {
            const selectedProgram = getSelectedProgram();
            const program = await programDb.getProgramByName(selectedProgram);
            if (patient.phone === mobileNumber
                && patient[PROGRAM_ID] === program.id) {
                patient.dob = this.formatDate(patient.dob)
                return patient
            } else {
                return null;
            }
        }
        return null;
    }

    formatDate(givenDate) {
        const dob = new Date(givenDate)
        let day = dob.getDate();
        let monthName = monthNames[dob.getMonth()];
        let year = dob.getFullYear();

        return `${day}-${monthName}-${year}`;
    }

    async recipientDetails() {
        let waiting = 0;
        let issue = 0;
        const programName = getSelectedProgram()
        if (this.db) {
            const result = await this.db.getAll(QUEUE);
            const currentProgram = await programDb.getProgramByName(programName)
            result.forEach((item) => {
                if (item[PROGRAM_ID] === currentProgram.id)
                    if (item[STATUS] === QUEUE_STATUS.IN_QUEUE) {
                        waiting++;
                    } else if (item[STATUS] === QUEUE_STATUS.COMPLETED) {
                        issue++;
                    }
            });
        }

        return [
            {titleKey: LANGUAGE_KEYS.RECIPIENT_WAITING, value: waiting},
            {titleKey: LANGUAGE_KEYS.CERTIFICATE_ISSUED, value: issue},
        ];
    }


    async getQueue(status) {
        if (status) {
            const programName = getSelectedProgram()
            const program = await programDb.getProgramByName(programName)
            const result = await this.db.getAll(QUEUE);
            const filter = result.filter((item) => {
                    return item[STATUS] === status && item[PROGRAM_ID] === program.id
                }
            );
            return Promise.resolve(filter)
        } else {
            return this.db.getAll(QUEUE)
        }
    }

    async markPatientAsComplete(enrollCode) {
        const patient = await this.db.get(QUEUE, enrollCode);
        patient.status = QUEUE_STATUS.COMPLETED;
        return this.db.put(QUEUE, patient)
    }

    async saveEvent(event) {
        event.date = new Date().toISOString()
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

    async saveWalkInEnrollments(walkEnrollment) {
        if (walkEnrollment) {
            walkEnrollment.code = Date.now().toString()
            const programName = getSelectedProgram()
            const currentProgram = await programDb.getProgramByName(programName)
            walkEnrollment.programId = currentProgram.id
            await this.saveEnrollments([walkEnrollment])
            const queue = {
                enrollCode: walkEnrollment.code,
                mobileNumber: walkEnrollment.phone,
                previousForm: "Payment Mode",
                name: walkEnrollment.name,
                dob: walkEnrollment.dob,
                gender: walkEnrollment.gender,
                status: QUEUE_STATUS.IN_QUEUE,
                code: walkEnrollment.code,
                programId: walkEnrollment.programId,
                identity: walkEnrollment.identity
            }
            await this.addToQueue(queue)
        } else {
            return Promise.reject(new Error("Failed to save"))
        }
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
        const filterObjects = result.filter((item) => item.hasOwnProperty("patient"));
        return filterObjects;
    }

    async getCertifyObject(event) {
        const patient = await this.db.get(PATIENTS, event.enrollCode);
        const vaccinator = await this.db.get(VACCINATORS, event.vaccinatorId);
        const queue = await this.db.get(QUEUE, event.enrollCode);
        console.log(patient, vaccinator, queue)
        if (patient && vaccinator && queue) {
            const vaccination = await programDb.getVaccinationDetails(event, patient.programId);
            return {
                vaccinatorName: vaccinator.name,
                patient: patient,
                enrollCode: event.enrollCode,
                identity: queue.identity || "",
                vaccination: vaccination
            }
        }
        return {}
    }

    async cleanEvents() {
        await this.db.clear(EVENTS)
    }

    async clearEverything() {
        const deletePatients = this.db.clear(PATIENTS);
        const deleteVaccinators = this.db.clear(VACCINATORS);
        const deleteEvents = this.db.clear(EVENTS);
        const deleteQueue = this.db.clear(QUEUE);
        const deletePrograms = this.db.clear(PROGRAMS);
        const deleteUserDetails = this.db.clear(USER_DETAILS);
        localStorage.clear()
        return Promise.all(
            [
                deleteEvents,
                deletePatients,
                deleteQueue,
                deleteVaccinators,
                deletePrograms,
                deleteUserDetails
            ]);
    }

    async getAllEvents() {
        return await this.db.getAll(EVENTS) || [];
    }
}

export const appIndexDb = new AppDatabase();


