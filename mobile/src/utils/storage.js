import {getSelectedProgram} from "../components/ProgramSelection";

export function saveVaccinationDetails(payload) {
    const selectedProgram = getSelectedProgram()
    localStorage.setItem(selectedProgram + "_vaccination_details", JSON.stringify(payload))
}


export function getVaccinationDetails() {
    const selectedProgram = getSelectedProgram()
    const vaccinationDetails = localStorage.getItem(selectedProgram + "_vaccination_details");
    if (!vaccinationDetails) {
        return {
            vaccinatorId: null,
            medicineId: null,
            batchId: []
        }
    }
    return JSON.parse(vaccinationDetails)
}
