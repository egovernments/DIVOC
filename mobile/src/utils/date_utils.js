export function formatCertifyDate(dob) {
    let day = dob.getDate();
    let month = (dob.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    let year = dob.getFullYear();
    return `${year}-${month}-${day}`;
}
