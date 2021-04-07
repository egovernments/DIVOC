export const getMeridiemTime = (time) => {
    const timeInNumber = parseInt(time.split(":")[0])
    if (timeInNumber > 0 && timeInNumber <= 11) {
        return time + " AM"
    } else if (timeInNumber === 12) {
        return time + " PM"
    } else if (timeInNumber === 0) {
        let t = 12 + ":" + time.split(":")[1]
        return t + " AM"
    } else {
        let t = timeInNumber - 12 + ":" + time.split(":")[1]
        return ((timeInNumber - 12) <= 9 ? '0' + t : t) + " PM"
    }
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