import {appIndexDb} from "../AppDatabase";

const PROGRAMS = "programs";

class ProgramDB {
    constructor() {
    }

    async getMedicines(programName) {
        this.db = appIndexDb.db;
        const programs = await this.db.get(PROGRAMS, programName);
        return programs.medicines || []
    }
}


export const programDb = new ProgramDB()
