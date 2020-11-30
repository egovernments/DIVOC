import {openDB} from "idb";

const DATABASE_NAME = "DivocDB"
const DATABASE_VERSION = 3
const PATIENTS = "patients";
const QUEUE = "queue";

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

export class AppDatabase {

    constructor() {
        this.initDb().then((value) => {
            this.db = value
        }).catch(e => {
            console.log("Error: " + e.message);
        });
    }

    async initDb() {
        const db = await openDB(DATABASE_NAME, DATABASE_VERSION, {
            upgrade(db) {
                db.createObjectStore(PATIENTS,
                    {
                        keyPath: "enrollCode", autoIncrement: true
                    });

                db.createObjectStore(QUEUE,
                    {keyPath: "enrollCode"});

            }
        });
        try {
            const allPatients = dummyPatient.map((value => db.put(PATIENTS, value)))
            const result = await Promise.all(allPatients)
        } catch (e) {
            console.log("Error Add: " + e);
            return db;
        }

        return db;
    }

    async addToQueue(patients) {
        patients.status = "in_queue"
        return this.db.add(QUEUE, patients);
    }

    async getPatientDetails(enrollCode) {
        return this.db.get(PATIENTS, enrollCode);
    }

    async recipientDetails() {
        const result = [
            {title: "Recipient Waiting", value: 42},
            {title: "Certificate Issued", value: 12},
        ];
        return Promise.resolve(result)
    }
}

export const appIndexDb = new AppDatabase()


