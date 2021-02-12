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
    const d = new Date(loginDate),
        minutes = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes() : d.getMinutes(),
        hours = d.getHours().toString().length === 1 ? '0' + d.getHours() : d.getHours(),
        ampm = d.getHours() >= 12 ? 'pm' : 'am';
    return d.getDate() + '-' + monthNames[d.getMonth()] + '-' + d.getFullYear() + ' ' + hours + ':' + minutes + ' ' + ampm;
}

export function formatDate(givenDate) {
    const dob = new Date(givenDate)
    let day = dob.getDate();
    let monthName = monthNames[dob.getMonth()];
    let year = dob.getFullYear();

    return `${day}-${monthName}-${year}`;
}
