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
    "Gender": {
        path: ["credentialSubject", "gender"],
        format: (data) => (data)
    },
    "Certificate ID": {
        path: ["evidence", "0", "certificateId"],
        format: (data) => (data)
    },
    "Date of Dose": {
        path: ["evidence", "0", "effectiveStart"],
        format: (data) => (formatDate(data))
    },
    "Valid Until": {
        path: ["evidence", "0", "effectiveUntil"],
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
