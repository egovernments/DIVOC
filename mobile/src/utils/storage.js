import {getSelectedProgram} from "../components/ProgramSelection";

export function saveVaccinationDetails(payload) {
    const vaccinationDetails = getVaccinationDetails() || {}
    vaccinationDetails.vaccinatorId = payload.vaccinatorId;
    vaccinationDetails.medicineId = payload.medicineId;
    vaccinationDetails.lastBatchId = payload.batchId
    if (vaccinationDetails.batchIds) {
        const batchIds = vaccinationDetails.batchIds
        if (!batchIds.includes(payload.batchId)) {
            batchIds.push(payload.batchId);
            vaccinationDetails.batchIds = batchIds;
        }
    } else {
        vaccinationDetails.batchIds = [payload.batchId]
    }
    const selectedProgram = getSelectedProgram()
    localStorage.setItem(selectedProgram + "_vaccination_details", JSON.stringify(vaccinationDetails))
}


export function getVaccinationDetails() {
    const selectedProgram = getSelectedProgram()
    const vaccinationDetails = localStorage.getItem(selectedProgram + "_vaccination_details");
    if (!vaccinationDetails) {
        return {
            vaccinatorId: null,
            medicineId: null,
            lastBatchId: null,
            batchIds: []
        }
    }
    return JSON.parse(vaccinationDetails)
}
