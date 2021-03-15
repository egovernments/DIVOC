import {appIndexDb} from "../AppDatabase";

const COMORBIDITIES = "comorbidities";

class ComorbiditiesDB {

    async getComorbidities(programId) {
        return await this.getDB().get(COMORBIDITIES, programId)
    }

    async saveComorbidities(programId, comorbidities) {
        const facilityProgram = this.getDB().put(COMORBIDITIES, {
            programId,
            comorbidities
        });
        return facilityProgram
    }

    getDB() {
        if (!this.db) {
            this.db = appIndexDb.db;
        }
        return this.db
    }

}


export const comorbiditiesDb = new ComorbiditiesDB()
