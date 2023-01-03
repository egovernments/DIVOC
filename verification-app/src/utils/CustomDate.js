import config from "../config"

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

export function padDigit(digit, totalDigits = 2) {
    return String(digit).padStart(totalDigits, '0')
}

export function formatDateLong(givenDate) {
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: config.TIMEZONE,
        weekday: "long"
    };
    const date = new Date(givenDate).toLocaleDateString('en-GB',options);
    return date.split(/ (.*)/s)[0] + " " + date.split(/ (.*)/s)[1].replace(/ /g,"-");
}

export function formatDateForSlot(givenDate) {
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: config.TIMEZONE,
        weekday: "short"
    };
    const date = new Date(givenDate).toLocaleDateString('en-GB',options);
    return date.split(" ")[0] + " " + date.split(" ")[2] + " " + date.split(" ")[1];
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