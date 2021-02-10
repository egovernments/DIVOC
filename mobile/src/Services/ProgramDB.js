import {appIndexDb} from "../AppDatabase";
import {formatCertifyDate} from "../utils/date_utils";
import {getSelectedProgram} from "../components/ProgramSelection";
import {CONSTANT} from "../utils/constants";

const PROGRAMS = "programs";
const VACCINATORS = "vaccinators";

class ProgramDB {

    async getMedicines(programName) {
        const programs = await this.getDB().get(PROGRAMS, programName);
        return programs.medicines || []
    }

    async getPrograms() {
        return this.db.getAll(PROGRAMS);
    }

    async getProgramByName(programName) {
        const program = await this.getDB().get(PROGRAMS, programName);
        return program
    }

    async savePrograms(programs) {
        const programList = programs || [];
        const facilityProgram = programList.map((item, index) => this.getDB().put(PROGRAMS, item));
        return Promise.all(facilityProgram)
    }

    async getVaccinationDetails(event, programId) {
        const allPrograms = await this.getPrograms()
        const eventDate = new Date(event.date);
        const givenVaccination = this.getPatientGivenMedicine(allPrograms, programId, event.medicineId)
        let repeatUntil = 0;
        if (givenVaccination["schedule"] && givenVaccination["schedule"]["repeatInterval"]) {
            repeatUntil = givenVaccination["schedule"]["repeatInterval"]
        }
        const medicineEffectiveDate = givenVaccination["effectiveUntil"] ?? 0;
        const effectiveUntilDate = this.getEffectiveUntil(eventDate, medicineEffectiveDate)
        return {
            batch: event.batchId,
            date: eventDate,
            effectiveStart: formatCertifyDate(eventDate),
            effectiveUntil: effectiveUntilDate,
            manufacturer: givenVaccination["provider"] ?? "N/A",
            name: givenVaccination["name"] ?? "N/A",
            //TODO: Need dose from vaccinator in UI
            dose: 1,
            totalDoses: repeatUntil,
        }
    }

    getDB() {
        if (!this.db) {
            this.db = appIndexDb.db;
        }
        return this.db
    }


    getEffectiveUntil(event, effectiveUntil) {
        const eventDate = new Date(event)
        const newDateMonths = eventDate.setMonth(eventDate.getMonth() + effectiveUntil);
        const newDate = new Date(newDateMonths);
        return formatCertifyDate(newDate);
    }

    getPatientGivenMedicine(allPrograms, programName, medicineId) {
        const patientProgram = allPrograms.find((value => {
            return value["name"] === programName
        }))
        const patientProgramMedicine = patientProgram["medicines"]
        if (patientProgramMedicine && patientProgramMedicine.length > 0) {
            const findProgramMedicine = patientProgramMedicine.find((value => {
                return value["name"] === medicineId
            }))
            if (findProgramMedicine != null) {
                return findProgramMedicine
            }
        }
        return {}
    }

    async getVaccinators() {
        const vaccinators = await this.getDB().getAll(VACCINATORS)
        const selectProgram = getSelectedProgram();
        return vaccinators.filter(vaccinator => {
            return vaccinator.programs &&
                vaccinator.programs.filter(p => p.programId === selectProgram && p.status === CONSTANT.ACTIVE).length > 0
        })
    }
}


export const programDb = new ProgramDB()
