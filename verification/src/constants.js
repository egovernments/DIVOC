import config from "./config";

export function formatDate(givenDate) {
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: config.TIMEZONE
    };
    const date = new Date(givenDate).toLocaleDateString('en-GB',options);
    return date.replace(/ /gi,"-");
}

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
    "Beneficiary ID": {
        path: ["credentialSubject", "refId"],
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
    "Date of ${dose} Dose": {
        path: ["evidence", "0", "date"],
        format: (data) => (formatDate(data))
    },
    "Vaccination Status": {
        path: ["evidence", "0"],
        format: (data) => {
            const dose = parseInt(data.dose)
            const totalDoses = parseInt(data.totalDoses) || 2
            if (dose > totalDoses) {
               return "Fully vaccinated and precaution dose administered"
            } else if (dose < totalDoses) {
                return "Partially Vaccinated"
            } else {
                return "Fully Vaccinated"
            }
        }
    },
    "Vaccination at": {
        path: ["evidence", "0", "facility", "name"],
        format: (data) => (data)
    },
    "Country of Vaccination": {
        path: ["evidence", "0", "facility", "address", "addressCountry"],
        format: (data) => (data),
        optional: true
    }
};
