const formatDate = (givenDate) => {
  const dob = new Date(givenDate);
  let day = dob.getDate();
  let monthName = monthNames[dob.getMonth()];
  let year = dob.getFullYear();

  return `${padDigit(day)}-${monthName}-${year}`;
}

const monthNames = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec"
];


const formatId = (identity) => {
  const split = identity.split(":");
  const lastFragment = split[split.length - 1];
  if (identity.includes("aadhaar") && lastFragment.length >= 4) {
    return "Aadhaar # XXXX XXXX XXXX " + lastFragment.substr(lastFragment.length - 4)
  }
  if (identity.includes("Driving")) {
    return "Driver’s License # " + lastFragment
  }
  if (identity.includes("MNREGA")) {
    return "MNREGA Job Card # " + lastFragment
  }
  if (identity.includes("PAN")) {
    return "PAN Card # " + lastFragment
  }
  if (identity.includes("Passbooks")) {
    return "Passbook # " + lastFragment
  }
  if (identity.includes("Passport")) {
    return "Passport # " + lastFragment
  }
  if (identity.includes("Pension")) {
    return "Pension Document # " + lastFragment
  }
  if (identity.includes("Voter")) {
    return "Voter ID # " + lastFragment
  }
  return lastFragment
}

function concatenateReadableString(a, b) {
  let address = "";
  address = appendCommaIfNotEmpty(address, a);
  address = appendCommaIfNotEmpty(address, b);
  if (address.length > 0) {
    return address
  }
  return "NA"
}

function appendCommaIfNotEmpty(address, suffix) {
  if (address.trim().length > 0) {
    if (suffix.trim().length > 0) {
      return address + ", " + suffix
    } else {
      return address
    }
  }
  return suffix
}

function padDigit(digit, totalDigits = 2) {
  return String(digit).padStart(totalDigits, '0')
}

function getNumberWithOrdinal(n) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + " " + (s[(v - 20) % 10] || s[v] || s[0]);
}

module.exports = {
  formatDate,
  formatId,
  concatenateReadableString,
  padDigit,
  getNumberWithOrdinal
}