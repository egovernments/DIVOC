import {openDB} from "idb";

const DATABASE_NAME = "DivocDB"
const DATABASE_VERSION = 3
const PATIENTS = "patients";
const QUEUE = "queue";
const STATUS = "status";

const QUEUE_STATUS = Object.freeze({"IN_QUEUE": "in_queue", "COMPLETED": "completed"})

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
        patients.status = "in_queue"
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
}

export const appIndexDb = new AppDatabase()


