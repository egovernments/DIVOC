const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

export function formatDate(givenDate) {
    const dob = new Date(givenDate);
    let day = (dob.getDate()).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    let monthName = monthNames[dob.getMonth()];
    let year = dob.getFullYear();

    return `${day}-${monthName}-${year}`;
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
    "Date of ${dose} Dose": {
        path: ["evidence", "0", "effectiveStart"],
        format: (data) => (formatDate(data))
    },
    "Vaccination Status": {
        path: ["evidence", "0"],
        format: (data) => {
            if (data.dose !== data.totalDoses) {
                return "Partially Vaccinated"
            } else {
                return "Fully Vaccinated"
            }
        }
    },
    "Vaccination at": {
        path: ["evidence", "0", "facility", "name"],
        format: (data) => (data)
    }
};

export const TestCertificateDetailsPaths = {
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
    "Beneficiary ID": {
        path: ["credentialSubject", "refId"],
        format: (data) => (data)
    },
    "Test Name": {
        path: ["evidence", "0", "testName"],
        format: (data) => (data)
    },
    "Date of Sample Collection": {
        path: ["evidence", "0", "sampleCollectionTimestamp"],
        format: (data) => (formatDate(data))
    },
    "Result": {
        path: ["evidence", "0", "result"],
        format: (data) => (data)
    },
    "Verified at": {
        path: ["evidence", "0", "facility", "name"],
        format: (data) => (data)
    }
};
