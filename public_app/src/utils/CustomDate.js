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

export function padDigit(digit, totalDigits = 2) {
    return String(digit).padStart(totalDigits, '0')
}

export function formatDateLong(givenDate) {
    const d = new Date(givenDate);
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]
    const day = d.getDate()
    const monthName = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${weekday}, ${day}-${monthName}-${year}`
}

export function formatTimeInterval12hr(t) {

    const to12Hr = (time) => {
        if (time) {
            const [hr, min] = time.split(":");
            const hr12 = hr == 0 ? "12" : (hr % 12) + "";
            const ampm = hr >= 12 ? "pm" : "am";
            return `${hr12}:${min} ${ampm}`
        }
    }
    
    if (t) {
        const [from, to] = t.split("-");
        const fromAmpm = to12Hr(from);
        const toAmpm = to12Hr(to);
        return `${fromAmpm} - ${toAmpm}`;
    }
}