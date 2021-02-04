export const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

export function formatCertifyDate(dob) {
    let day = dob.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    let month = (dob.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    let year = dob.getFullYear();
    return `${year}-${month}-${day}`;
}


export function formatLoginDate(loginDate) {
    const date = new Date(loginDate)
    let day = date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    let year = date.getFullYear();
    let monthName = monthNames[date.getMonth()];
    return `${day}-${monthName}-${year}`;
}
