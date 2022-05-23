import {appIndexDb} from "../AppDatabase";
import {CONSTANT} from "../utils/constants";

const AUTHORIZE = "/divoc/api/v1/authorize"
const PRE_ENROLLMENT = "/divoc/api/v1/preEnrollments"
const PROGRAMS = "/divoc/api/v1/programs/current"
const VACCINATORS = "/divoc/admin/api/v1/vaccinators"
const CERTIFY = "/divoc/api/v1/certify"
const USER_INFO = "/divoc/api/v1/users/me"
const FACILITY_DETAILS = "/divoc/admin/api/v1/facility";
const FACILITY_ID = "FACILITY_ID"
const ENROLLMENT_ID = "ENROLLMENT_ID"
const PROGRAM_ID = "PROGRAM_ID"
const ETCD_KEY = "ETCD_KEY"
const FACILITY_SLOTS = `/divoc/admin/api/v1/facility/${FACILITY_ID}/schedule`
const ENROLLMENT_BY_CODE = `/divoc/api/v1/preEnrollments/${ENROLLMENT_ID}`
const VERIFY_CERTIFICATE = "/divoc/api/v1/certificate/revoked"
const ETCD_APPLICATION_CONFIG = `/divoc/admin/api/v1/config/${ETCD_KEY}`;

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

    static async fetchPreEnrollments(date=new Date()) {
        const qParams = new URLSearchParams();
        qParams.set("date", date.toISOString().slice(0, 10));
        const requestOptions = {
            method: 'GET',
            headers: {'accept': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem("token")}
        };
        return fetch(PRE_ENROLLMENT + `?${qParams.toString()}`, requestOptions)
            .then(response => response.json())
    }

    static async fetchEnrollmentByCode(enrollCode) {
        const requestOptions = {
            method: 'GET',
            headers: {'accept': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem("token")}
        };
        const apiURL = ENROLLMENT_BY_CODE.replace(ENROLLMENT_ID, enrollCode)
        return fetch(apiURL, requestOptions)
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
                enrollmentType: patientDetails.enrollmentType,
                programId: item.programId,
                comorbidities: patientDetails.comorbidities ?? [],
                recipient: {
                    contact: [
                        "tel:" + patientDetails.phone,
                        "mailto:" + patientDetails.email
                    ],
                    age: "" + (new Date().getFullYear() - patientDetails.yob),
                    gender: patientDetails.gender,
                    identity: item.identity ? item.identity : "",
                    name: patientDetails.name,
                    nationality: patientDetails.nationalId,

                    address: {
                        addressLine1: patientDetails.address.addressLine1 ?? "N/A",
                        addressLine2: patientDetails.address.addressLine2 ?? "N/A",
                        district: patientDetails.address.district ?? "N/A",
                        state: patientDetails.address.state ?? "N/A",
                        pincode: patientDetails.address.pincode ?? "N/A"
                    }
                },

                vaccination: {
                    batch: item.vaccination.batch,
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
                        pincode: facilityDetails.address.pincode ?? "N/A"
                    }
                },
                meta: {
                    enrollmentOsid: patientDetails.osid ?? ""
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

    static async fetchApplicationConfigFromEtcd() {
        const data = {
            "key": CONSTANT.COUNTRY_SPECIFIC_FEATURES_KEY
        };
        return this.fetchEtcdConfigs(data);
    }

    static fetchEtcdConfigs(data) {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
        };

        const apiURL = ETCD_APPLICATION_CONFIG
            .replace(ETCD_KEY, data.key);

        return fetch(apiURL, requestOptions)
            .then(response => {
                console.log(response.json())
                return response.json()
            })
    }

    static async fetchFacilitySchedule(facilityId) {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
        };
        const apiURL = FACILITY_SLOTS
            .replace(FACILITY_ID, facilityId);

        return fetch(apiURL, requestOptions)
            .then(response => {
                return response.json()
            })
    }

    static async checkIfRevokedCertificate(data) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(data)
        };
        return fetch(VERIFY_CERTIFICATE, requestOptions)
            .then(response => {
                return response
            }).catch((e) => {
                console.log(e);
                return e
            });
    }
}
