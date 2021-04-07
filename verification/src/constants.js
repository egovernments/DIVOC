const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

export function formatDate(givenDate) {
    const dob = new Date(givenDate);
    let day = dob.getDate();
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
    "Date of Dose": {
        path: ["evidence", "0", "effectiveStart"],
        format: (data) => (formatDate(data))
    },
    "Vaccination at": {
        path: ["evidence", "0", "facility", "name"],
        format: (data) => (data)
    }
};
