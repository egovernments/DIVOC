import {appIndexDb} from "../AppDatabase";

const AUTHORIZE = "/divoc/api/v1/authorize"
const PRE_ENROLLMENT = "/divoc/api/v1/preEnrollments"
const PROGRAMS = "/divoc/api/v1/programs/current"
const VACCINATORS = "/divoc/api/v1/vaccinators"
const CERTIFY = "/divoc/api/v1/certify"
const USER_INFO = "/divoc/api/v1/users/me"

export class ApiServices {

    static async login(mobileNumber, otp) {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'accept': 'application/json'},
            body: JSON.stringify({mobile: mobileNumber, token2fa: otp})
        };
        return fetch(AUTHORIZE, requestOptions)
            .then(response => response.json())
    }

    static async fetchPreEnrollments() {
        const requestOptions = {
            method: 'GET',
            headers: {'accept': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem("token")}
        };
        return fetch(PRE_ENROLLMENT, requestOptions)
            .then(response => response.json())
    }

    static async fetchPrograms() {
        const requestOptions = {
            method: 'GET',
            headers: {'accept': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem("token")}
        };
        return fetch(PROGRAMS, requestOptions)
            .then(response => response.json())
    }


    static async fetchVaccinators() {
        const requestOptions = {
            method: 'GET',
            headers: {'accept': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem("token")}
        };
        return fetch(VACCINATORS, requestOptions)
            .then(response => response.json())
    }

    static async certify(certifyPatients) {
        const userDetails = await appIndexDb.getUserDetails();
        const allPrograms = await appIndexDb.getPrograms()
        const certifyBody = certifyPatients.map((item, index) => {
            const patientDetails = item.patient;
            const givenVaccination = this.getPatientGivenMedicine(allPrograms, patientDetails.programId)
            return {
                preEnrollmentCode: item.enrollCode,
                recipient: {
                    contact: [
                        "tel:" + patientDetails.phone
                    ],
                    dob: patientDetails.dob,
                    //TODO: remove age
                    age: "0",
                    gender: patientDetails.gender,
                    identity: item.identity ? "did:in.gov.uidai.aadhaar:" + item.identity : "",
                    name: patientDetails.name,
                    nationality: patientDetails.nationalId,

                    //TODO: Need to get recipient in date format
                    address: {
                        addressLine1: "TEST",
                        addressLine2: "TEST",
                        district: "TEST",
                        state: "TEST",
                        pincode: 100000
                    }
                },

                vaccination: {
                    batch: item.batchCode,
                    date: "2020-12-02T09:44:03.802Z",
                    effectiveStart: "2020-12-02",
                    //TODO: Need to get effectiveUntil in date format
                    effectiveUntil: "2020-12-02",//""+givenVaccination["effectiveUntil"],
                    manufacturer: givenVaccination["provider"] ?? "N/A",
                    name: givenVaccination["name"] ?? "N/A",
                    //TODO: Need to get dose and total doeses in date format
                    dose: 1,
                    totalDoses: 1,
                },
                vaccinator: {
                    name: item.vaccinator.name
                },
                facility: {
                    name: userDetails.facility.facilityName,
                    //TODO: Need to get address from user/me api.
                    address: {
                        addressLine1: "TEST",
                        addressLine2: "TEST",
                        district: "TEST",
                        state: "TEST",
                        pincode: 100000
                    }
                }
            }
        })

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
            body: JSON.stringify(certifyBody)
        };

        return fetch(CERTIFY, requestOptions)
            .then(response => {
                if (response.status === 200) {
                    return {}
                }
                return response.json()
            })
    }

    static async getUserDetails() {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
        };
        return fetch(USER_INFO, requestOptions)
            .then(response => {
                return response.json()
            })
    }

    static getPatientGivenMedicine(allPrograms, programName) {
        const patientProgram = allPrograms.find((value => {
            console.log(value["name"], programName)
            return value["name"] === programName
        }))
        const patientProgramMedicine = patientProgram["medicines"]
        if (patientProgramMedicine && patientProgramMedicine.length > 0) {
            return patientProgramMedicine[0]
        }
        return {}
    }
}
