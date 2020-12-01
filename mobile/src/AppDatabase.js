import {openDB} from "idb";

const DATABASE_NAME = "DivocDB"
const DATABASE_VERSION = 4
const PATIENTS = "patients";
const QUEUE = "queue";
const EVENTS = "events";
const STATUS = "status";

export const QUEUE_STATUS = Object.freeze({"IN_QUEUE": "in_queue", "COMPLETED": "completed"})

const dummyPatient = [
    {name: "Vivek Sign", gender: "Male", dob: "01-Jan-2000", enrollCode: "12341"},
    {name: "John Smith", gender: "Male", dob: "12-May-1996", enrollCode: "12342"},
    {name: "Sahima Mani", gender: "Female", dob: "22-Feb-1991", enrollCode: "12343"},
    {name: "Punit Johal", gender: "Male", dob: "16-May-1986", enrollCode: "12344"},
    {name: "Sita Baria", gender: "Female", dob: "02-Oct-1982", enrollCode: "12345"},
    {name: "Anand Divan", gender: "Male", dob: "29-Dec-2000", enrollCode: "12346"},
    {name: "Ishani Sinha", gender: "Female", dob: "15-Aug-1978", enrollCode: "12347"},
    {name: "Madhur Khalsa", gender: "Male", dob: "01-Jan-1999", enrollCode: "12348"},
    {name: "Navin Kannan", gender: "Male", dob: "12-May-1996", enrollCode: "12349"}
]

const vaccinators = [
    {vaccinator: "Dr. Vivek Sign", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. Gregory House", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},
    {vaccinator: "Dr. AR Rahman", signatureImg: ""},

]

export class AppDatabase {

    async initDb() {
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade(db) {
                db.createObjectStore(PATIENTS,
                    {
                        keyPath: "enrollCode", autoIncrement: true
                    });

                db.createObjectStore(QUEUE,
                    {keyPath: "enrollCode"});

                db.createObjectStore(EVENTS,
                    {keyPath: "id", autoIncrement: true});

            }
        });
        this.db = db;
        //TODO: Need to remove after API intigrations. Seeding data for testing
        try {
            const allPatients = dummyPatient.map((value => db.put(PATIENTS, value)))
            await Promise.all(allPatients)
        } catch (e) {
            console.log("Error Add: " + e);
            return db;
        }
        return db;
    }

    async addToQueue(patients) {
        patients.status = QUEUE_STATUS.IN_QUEUE
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
        return Promise.resolve(vaccinators)
    }

    async markPatientAsComplete(enrollCode) {
        const patient = await this.db.get(QUEUE, enrollCode)
        patient.status = QUEUE_STATUS.COMPLETED
        return this.db.put(QUEUE, patient)
    }

    async saveEvent(event) {
        return this.db.add(EVENTS, event)
    }
}

export const appIndexDb = new AppDatabase()


