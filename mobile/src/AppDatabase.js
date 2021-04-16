import {openDB} from "idb";
import {LANGUAGE_KEYS} from "./lang/LocaleContext";
import {getSelectedProgram, getSelectedProgramId} from "./components/ProgramSelection";
import {programDb} from "./Services/ProgramDB";
import {monthNames, weekdays} from "./utils/date_utils";
import {ApiServices} from "./Services/ApiServices";

const DATABASE_NAME = "DivocDB";
const DATABASE_VERSION = 14;
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
const APPLICATION_CONFIGS = "application_configs";

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
        optionalParameters: {keyPath: "programId"},
    },
    {
        table: COMORBIDITIES,
        optionalParameters: {keyPath: "programId"}
    },
    {
        table: APPLICATION_CONFIGS,
        optionalParameters: {}
    }
]

const PROGRAM_ID = "programId";

export const QUEUE_STATUS = Object.freeze({IN_QUEUE: "in_queue", COMPLETED: "completed"});
export const ENROLLMENT_TYPES = Object.freeze({PRE_ENROLLMENT: "PRE_ENRL", SELF_ENROLLMENT: "SELF_ENRL", WALK_IN: "WALK_IN"});

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

    async getPatientDetailsFromQueue(enrollCode) {
        const queue = await this.db.get(QUEUE, enrollCode);
        return queue
    }

    async createAppointment(patient) {
        const selectedProgramId = await getSelectedProgramId();
        const currSch = await this.getCurrentAppointmentSlot();
        const facilityDetails = await this.getUserDetails();
        const program = await programDb.getProgramByName(getSelectedProgram());

        function canCreateAppointmentForNextDose(patient) {
            let result = false;
            patient["appointments"]
                .filter(a => a["programId"] === selectedProgramId && a.vaccine)
                .map(a => program.medicines.filter(m => m.name === a.vaccine).map(v => {
                    const lastDoseTaken = patient["appointments"].filter(a => a[PROGRAM_ID] === selectedProgramId && a.certified).length
                    const sortedAppointments = patient["appointments"].filter(a => a["programId"] === selectedProgramId && a.certified)
                        .sort((a, b) => {
                            if (parseInt(a.dose) > parseInt(b.dose)) return 1;
                            if (parseInt(a.dose) < parseInt(b.dose)) return -1;
                            return 0;
                        });
                    if (parseInt(((new Date() - new Date(sortedAppointments.filter(a => a.certified)[sortedAppointments.length-1].appointmentDate))/(1000*60*60*24)).toFixed()) >= v.doseIntervals[lastDoseTaken-1].min) {
                        result = true
                    }
                }));
            return result
        }

        // get open appointment for current program
        let currentAppointment = patient["appointments"].filter(a => a["programId"] === selectedProgramId && !a.certified)[0];
        if (!currentAppointment) {
            // createAppointment for next dose if applicable
            patient["appointments"]
                .filter(a => a["programId"] === selectedProgramId && a.vaccine)
                .map(a => program.medicines.filter(m => m.name === a.vaccine).map(v => {
                    const lastDoseTaken = patient["appointments"].filter(a => a[PROGRAM_ID] === selectedProgramId).length
                    const sortedAppointments = patient["appointments"].filter(a => a["programId"] === selectedProgramId)
                        .sort((a, b) => {
                            if (parseInt(a.dose) > parseInt(b.dose)) return 1;
                            if (parseInt(a.dose) < parseInt(b.dose)) return -1;
                            return 0;
                        });
                    if (parseInt(sortedAppointments[sortedAppointments.length-1].dose) < v.doseIntervals.length+1) {
                        // check if next dose min interval is matched
                        if (parseInt(((new Date() - new Date(sortedAppointments[sortedAppointments.length-1].appointmentDate))/(1000*60*60*24)).toFixed()) >= v.doseIntervals[lastDoseTaken-1].min) {
                            patient["appointments"].push({
                                "programId": selectedProgramId,
                                "dose": patient["appointments"].filter(a => a[PROGRAM_ID] === selectedProgramId).length+1,
                                "certified": false,
                                "vaccine": v.name,
                                "enrollmentScopeId": facilityDetails["facility_code"],
                                "appointmentDate": new Date().toISOString().slice(0, 10),
                                "appointmentSlot": currSch.startTime ? currSch.startTime+"-"+currSch.endTime : ""
                            });
                            this.db.put(PATIENTS, patient)
                        }
                    }
                }));
            return patient
        }

        // adding enrollment details for non booked appointments
        if (!currentAppointment.enrollmentScopeId) {
            if (currentAppointment.dose === "1" || canCreateAppointmentForNextDose(patient)) {
                patient["appointments"].map(a => {
                    if (a["programId"] === getSelectedProgramId() && !a.certified) {
                        a.enrollmentScopeId = facilityDetails["facility_code"];
                        a.appointmentDate = new Date().toISOString().slice(0, 10);
                        a.appointmentSlot = currSch.startTime ? currSch.startTime+"-"+currSch.endTime : "";
                    }
                });
                await this.db.put(PATIENTS, patient)
            } else {

            }
        }
        return patient
    }

    async getPatientDetails(enrollCode, isOnline) {
        let patient = await this.db.get(PATIENTS, enrollCode);
        if (!patient && isOnline) {
            patient = await ApiServices.fetchEnrollmentByCode(enrollCode);
            await this.db.put(PATIENTS, patient);
        }

        const selectedProgramId = getSelectedProgramId();

        if (patient) {
            if (patient["appointments"].filter(a => a[PROGRAM_ID] === selectedProgramId)) {
                let currentAppointment = patient["appointments"].filter(a => a["programId"] === selectedProgramId && !a.certified)[0]
                if (!currentAppointment || !currentAppointment.enrollmentScopeId) {
                    return await this.createAppointment(patient);
                }
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

    async markPatientAsComplete(payload) {
        const patient = await this.db.get(QUEUE, payload.enrollCode);
        const selectedProgramId = getSelectedProgramId()
        // if not walkin, update appointment info
        if (patient.enrollmentType !== ENROLLMENT_TYPES.WALK_IN) {
            patient.appointments.map(a => {
                if (a["programId"] === selectedProgramId && !a.certified) {
                    a["certified"] = true
                    a["vaccine"] = a["vaccine"] ? a["vaccine"]: payload.medicineId
                }
            });

            // update in patients table
            const patientFromEnrollment = await this.db.get(PATIENTS, payload.enrollCode)
            patientFromEnrollment.appointments.map(a => {
                if (a["programId"] === selectedProgramId && !a.certified) {
                    a["certified"] = true;
                    a["vaccine"] = a["vaccine"] ? a["vaccine"]: payload.medicineId
                }
            });
            await this.db.put(PATIENTS, patientFromEnrollment)
        }
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

    async saveEnrollments(enrollments, enrollmentType) {
        const enrollmentsList = enrollments || [];
        const patients = enrollmentsList.map((item, index) => {
            item.enrollmentType = item.enrollmentType ? item.enrollmentType: enrollmentType;
            return this.db.put(PATIENTS, item)
        });
        return Promise.all(patients)
    }

    async saveWalkInEnrollments(walkEnrollment) {
        if (walkEnrollment) {
            walkEnrollment.code = Date.now().toString()
            const programId = getSelectedProgramId()
            walkEnrollment.programId = programId
            await this.saveEnrollments([walkEnrollment],ENROLLMENT_TYPES.WALK_IN)
            const queue = {
                enrollCode: walkEnrollment.code,
                enrollmentType: ENROLLMENT_TYPES.WALK_IN,
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
            const vaccination = await programDb.getVaccinationDetails(event, queue.programId);
            return {
                vaccinatorName: vaccinator.name,
                patient: patient,
                enrollCode: event.enrollCode,
                identity: queue.identity || "",
                vaccination: vaccination,
                programId: queue.programId
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
        const deleteFacilitySchedule = this.db.clear(FACILITY_SCHEDULE);
        localStorage.clear()
        return Promise.all(
            [
                deleteEvents,
                deletePatients,
                deleteQueue,
                deleteVaccinators,
                deletePrograms,
                deleteUserDetails,
                deleteFacilitySchedule
            ]);
    }

    async getAllEvents() {
        return await this.db.getAll(EVENTS) || [];
    }

    async getFacilitySchedule() {
        const selectedProgramId = getSelectedProgramId()
        if (selectedProgramId) {
            return await this.db.get(FACILITY_SCHEDULE, selectedProgramId);
        }
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

    async saveFacilitySchedule(facilitySchedules) {
        const schedules = (facilitySchedules || []).map(s => {
            return this.db.put(FACILITY_SCHEDULE, s)
        })
        return Promise.all(schedules);
    }
}

export const appIndexDb = new AppDatabase();
