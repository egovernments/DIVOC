import {openDB} from "idb";


export class AppDatabase {

    constructor() {
        this.initDb().then((value) => {
            this.db = value
            console.log("Init: " + this.db);
        });
    }

    async initDb() {
        const db = await openDB("DivocDB", 1, {
            upgrade(db) {
                db.createObjectStore("patients",
                    {keyPath: "id", autoIncrement: true})
            }
        });
        return db;
    }

    async addPatient(patients) {
        console.log(this.db);
        return this.db.add('patients', patients);
    }

    async recipientDetails() {
        const result = [
            {title: "Recipient Waiting", value: 42},
            {title: "Certificate Issued", value: 12},
        ];
        return Promise.resolve(result)
    }

}

export const indexDb = new AppDatabase()


