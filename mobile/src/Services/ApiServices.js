import {appIndexDb} from "../AppDatabase";

const AUTHORIZE = "/divoc/api/v1/authorize"
const PRE_ENROLLMENT = "/divoc/api/v1/preEnrollments"
const PROGRAMS = "/divoc/api/v1/programs/current"
const VACCINATORS = "/divoc/api/v1/vaccinators"
const CERTIFY = "/divoc/api/v1/certify"
const USER_INFO = "/divoc/api/v1/users/me"

export class ApiServices {

    static async requestOtp(mobileNumber) {
        const payload = {mobile: mobileNumber, token2fa: "1231"}
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'accept': 'application/json', 'Accept': '/'},
            body: JSON.stringify(payload)
        };
        return fetch(AUTHORIZE, requestOptions)
            .then(response => {
                return response.json()
            })
    }

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
        const certifyBody = certifyPatients.map((item, index) => {
            return {
                preEnrollmentCode: item.enrollCode,
                recipient: {
                    contact: [
                        "tel:" + item.patient.phone
                    ],
                    dob: item.patient.dob,
                    gender: item.patient.gender,
                    identity: "did:in.gov.uidai.aadhaar:" + item.identity,
                    name: item.patient.name,
                    nationality: item.patient.nationality
                },
                vaccination: {
                    batch: item.batchCode,
                    date: "2020-12-02T09:44:03.802Z",
                    effectiveStart: "2020-12-02",
                    effectiveUntil: "2020-12-02",
                    manufacturer: "string",
                    name: "COVID-19"
                },
                vaccinator: {
                    name: item.vaccinator.name
                },
                facility: {
                    name: userDetails.facility.facilityName,
                    address: {}
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
}
