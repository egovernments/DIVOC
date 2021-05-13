const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];

export function formatDate(givenDate) {
    const dob = new Date(givenDate);
    let day = (dob.getDate()).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    let monthName = monthNames[dob.getMonth()]
    let year = dob.getFullYear();

    return `${day}-${monthName}-${year}`;
}

export function formatYYYYMMDDDate(givenDate) {
    const dob = new Date(givenDate);
    let day = (dob.getDate()).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    let month =(dob.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    let year = dob.getFullYear();

    return `${year}-${month}-${day}`;
}

export function ordinal_suffix_of(i) {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}
