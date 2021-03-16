import {openDB} from "idb";
import {LANGUAGE_KEYS} from "./lang/LocaleContext";
import {getSelectedProgramId} from "./components/ProgramSelection";
import {programDb} from "./Services/ProgramDB";
import {monthNames, weekdays} from "./utils/date_utils";

const DATABASE_NAME = "DivocDB";
const DATABASE_VERSION = 13;
const PATIENTS = "patients";
const PROGRAMS = "programs";
const QUEUE = "queue";
const STASH_DATA = "stash_data";
const EVENTS = "events";
const VACCINATORS = "vaccinators";
const STATUS = "status";
const USER_DETAILS = "user_details";
const FACILITY_SCHEDULE = "facility_schedule";
const COMORBIDITIES = "comorbidities";

const dbConfigs = [
    {
        table: PATIENTS,
        optionalParameters: {keyPath: "code"}
    },
    {
        table: QUEUE,
        optionalParameters: {keyPath: "code"},
    },
    {
        table: VACCINATORS,
        optionalParameters: {keyPath: "osid"},
    },
    {
        table: EVENTS,
        optionalParameters: {keyPath: "id", autoIncrement: true},
    },
    {
        table: USER_DETAILS,
        optionalParameters: {},
    },
    {
        table: PROGRAMS,
        optionalParameters: {keyPath: "name"},
    },
    {
        table: STASH_DATA,
        optionalParameters: {keyPath: "userId"},
    },
    {
        table: FACILITY_SCHEDULE,
        optionalParameters: {},
    },
    {
        table: COMORBIDITIES,
        optionalParameters: {keyPath: "programId"}
    }
]

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

                dbConfigs.forEach(config => {
                    if (!objectNames.contains(config.table)) {
                        database.createObjectStore(config.table, config.optionalParameters);
                    }
                });
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

    async getPatientDetails(enrollCode) {
        const patient = await this.db.get(PATIENTS, enrollCode);
        const inQueue = await this.db.get(QUEUE, enrollCode);
        if (patient && !inQueue) {
            const selectedProgramId = getSelectedProgramId();
            if (patient["appointments"][0][PROGRAM_ID] === selectedProgramId) {
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
        const programId = getSelectedProgramId()
        if (this.db) {
            const result = await this.db.getAll(QUEUE);
            result.forEach((item) => {
                if (item[PROGRAM_ID] === programId)
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

    async getCompletedCountForAppointmentBookedBeneficiaries(appointmentSlot) {
        if (this.db) {
            const result = await this.db.getAll(QUEUE);
            return result.filter((beneficiary) => beneficiary.appointments
                && beneficiary.status === QUEUE_STATUS.COMPLETED
                && beneficiary.appointments.some(appointment => appointment.appointmentSlot === appointmentSlot)).length
        } else {
            return 0
        }
    }

    async getQueue(status) {
        if (status) {
            const programId = getSelectedProgramId()
            const result = await this.db.getAll(QUEUE);
            const filter = result.filter((item) => {
                    return item[STATUS] === status && item[PROGRAM_ID] === programId
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

    async getAllEnrollments() {
        return await this.db.getAll(PATIENTS)
    }

    async saveEnrollments(enrollments) {
        const enrollmentsList = enrollments || [];
        const patients = enrollmentsList.map((item, index) => this.db.put(PATIENTS, item));
        return Promise.all(patients)
    }

    async saveWalkInEnrollments(walkEnrollment) {
        if (walkEnrollment) {
            walkEnrollment.code = Date.now().toString()
            const programId = getSelectedProgramId()
            walkEnrollment.programId = programId
            await this.saveEnrollments([walkEnrollment])
            const queue = {
                enrollCode: walkEnrollment.code,
                mobileNumber: walkEnrollment.phone,
                previousForm: "Payment Mode",
                name: walkEnrollment.name,
                dob: walkEnrollment.dob,
                yob: walkEnrollment.yob,
                age: new Date().getFullYear() - walkEnrollment.yob,
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

    async getFacilitySchedule() {
        return this.db.get(FACILITY_SCHEDULE, FACILITY_SCHEDULE);
    }

    async getCurrentAppointmentSlot() {
        let currentSlot = {};
        const today = new Date();
        const currentDay = weekdays[today.getDay()];
        const currentTime = today.getTime();
        await appIndexDb.getFacilitySchedule()
            .then((scheduleResponse) => {
                const appointmentSchedules = scheduleResponse["appointmentSchedule"];
                if (appointmentSchedules) {
                    appointmentSchedules.forEach(as => {
                        let startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), as.startTime.split(":")[0], as.startTime.split(":")[1]).getTime();
                        let endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), as.endTime.split(":")[0], as.endTime.split(":")[1]).getTime();
                        if (as.days.map(d => d.day).includes(currentDay) && currentTime >= startTime && currentTime <= endTime) {
                            currentSlot = as
                        }
                    })
                }
            });
        return currentSlot
    }

    async saveFacilitySchedule(facilitySchedule) {
        return this.db.put(FACILITY_SCHEDULE, facilitySchedule, FACILITY_SCHEDULE)
    }
}

export const appIndexDb = new AppDatabase();
