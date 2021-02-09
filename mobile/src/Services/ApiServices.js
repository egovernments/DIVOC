import {appIndexDb} from "../AppDatabase";

const AUTHORIZE = "/divoc/api/v1/authorize"
const PRE_ENROLLMENT = "/divoc/api/v1/preEnrollments"
const PROGRAMS = "/divoc/api/v1/programs/current"
const VACCINATORS = "/divoc/admin/api/v1/vaccinators"
const CERTIFY = "/divoc/api/v1/certify"
const USER_INFO = "/divoc/api/v1/users/me"
const FACILITY_DETAILS = "/divoc/admin/api/v1/facility";
const FLAGR_APPLICATION_CONFIG = "/config/api/v1/evaluation";

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
        const facilityDetails = userDetails.facilityDetails;
        const certifyBody = certifyPatients.map((item, index) => {
            const patientDetails = item.patient;
            return {
                preEnrollmentCode: item.enrollCode,
                recipient: {
                    contact: [
                        "tel:" + patientDetails.phone,
                        "mailto:" + patientDetails.email
                    ],
                    dob: patientDetails.dob,
                    gender: patientDetails.gender,
                    identity: item.identity ? "did:in.gov.uidai.aadhaar:" + item.identity : "",
                    name: patientDetails.name,
                    nationality: patientDetails.nationalId,

                    address: {
                        addressLine1: patientDetails.address.addressLine1 ?? "N/A",
                        addressLine2: patientDetails.address.addressLine2 ?? "N/A",
                        district: patientDetails.address.district ?? "N/A",
                        state: patientDetails.address.state ?? "N/A",
                        pincode: patientDetails.address.pincode ?? 100000
                    }
                },

                vaccination: {
                    batch: item.batchId,
                    date: item.vaccination.date,
                    effectiveStart: item.vaccination.effectiveStart,
                    effectiveUntil: item.vaccination.effectiveUntil,
                    manufacturer: item.vaccination.manufacturer,
                    name: item.vaccination.name,
                    dose: item.vaccination.dose,
                    totalDoses: item.vaccination.totalDoses,
                },
                vaccinator: {
                    name: item.vaccinatorName
                },
                facility: {
                    name: facilityDetails.facilityName ?? "N/A",
                    address: {
                        addressLine1: facilityDetails.address.addressLine1 ?? "N/A",
                        addressLine2: facilityDetails.address.addressLine2 ?? "N/A",
                        district: facilityDetails.address.district ?? "N/A",
                        state: facilityDetails.address.state ?? "N/A",
                        pincode: facilityDetails.address.pincode ?? 100000
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

    static async getFacilityDetails() {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
        };
        return fetch(FACILITY_DETAILS, requestOptions)
            .then(response => {
                return response.json()
            })
    }

    static async fetchApplicationConfigFromFlagr() {
        const data = {
            "flagKey": "country_specific_features"
        };
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(data)
        };
        return fetch(FLAGR_APPLICATION_CONFIG, requestOptions)
            .then(response => {
                return response.json()
            })
    }
}
