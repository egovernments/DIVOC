import {formatDate} from "./utils/date_utils";

export const CertificateDetailsPaths = {
    "Name": {
        path: ["credentialSubject", "name"],
        format: (data) => (data)
    },
    "Age": {
        path: ["credentialSubject", "age"],
        format: (data) => (data)
    },
    "DOB": {
        path: ["credentialSubject", "dob"],
        format: (data) => (data),
        optional: true
    },
    "Gender": {
        path: ["credentialSubject", "gender"],
        format: (data) => (data)
    },
    "Certificate ID": {
        path: ["evidence", "0", "certificateId"],
        format: (data) => (data)
    },
    "Vaccine Name": {
        path: ["evidence", "0", "vaccine"],
        format: (data) => (data)
    },
    "Vaccine Type": {
        path: ["evidence", "0", "prophylaxis"],
        format: (data) => (data),
        optional: true
    },
    "Date of Dose": {
        path: ["evidence", "0", "effectiveStart"],
        format: (data) => (formatDate(data))
    },
    "Dose": {
        path: ["evidence", "0", "dose"],
        format: (data) => (data)
    },
    "Total Doses": {
        path: ["evidence", "0", "totalDoses"],
        format: (data) => (data)
    },
    "Vaccination Facility": {
        path: ["evidence", "0", "facility", "name"],
        format: (data) => (data)
    }
};
