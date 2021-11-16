import {formatDate} from "./utils/CustomDate";

export const RECIPIENT_CLIENT_ID = "certificate-login";
export const RECIPIENT_ROLE = "recipient";
export const SIDE_EFFECTS_DATA = "SIDE_EFFECTS_DATA";
export const API_ROOT_URL = 'https://api.covid19india.org/v4';
export const CERTIFICATE_FILE = "certificate.json";
export const PROGRAM_API = "/divoc/admin/api/v1/public/programs?status=Active";
export const RECIPIENTS_API = "/divoc/api/citizen/recipients";
export const CITIZEN_TOKEN_COOKIE_NAME = "citizenToken";
export const STATE_NAMES = {
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CT: 'Chhattisgarh',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JH: 'Jharkhand',
  KA: 'Karnataka',
  KL: 'Kerala',
  MP: 'Madhya Pradesh',
  MH: 'Maharashtra',
  MN: 'Manipur',
  ML: 'Meghalaya',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OR: 'Odisha',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  TR: 'Tripura',
  UT: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
  AN: 'Andaman and Nicobar Islands',
  CH: 'Chandigarh',
  DN: 'Dadra and Nagar Haveli and Daman and Diu',
  DL: 'Delhi',
  JK: 'Jammu and Kashmir',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  PY: 'Puducherry',
  TT: 'All of India',
};


export const CertificateDetailsPaths = {
  "Name": {
    path: ["credentialSubject", "name"],
    format: (data) => (data)
  },
  "Age": {
    path: ["credentialSubject", "age"],
    format: (data) => (data)
  },
  "DOB": {
    path: ["credentialSubject", "dob"],
    format: (data) => (data),
    optional: true
  },
  "Gender": {
    path: ["credentialSubject", "gender"],
    format: (data) => (data)
  },
  "Certificate ID": {
    path: ["evidence", "0", "certificateId"],
    format: (data) => (data)
  },
  "Vaccine Name": {
    path: ["evidence", "0", "vaccine"],
    format: (data) => (data)
  },
  "Vaccine Type": {
    path: ["evidence", "0", "prophylaxis"],
    format: (data) => (data),
    optional: true
  },
  "Date of Issue": {
    path: ["evidence", "0", "effectiveStart"],
    format: (data) => (formatDate(data))
  },
  "Valid Until": {
    path: ["evidence", "0", "effectiveUntil"],
    format: (data) => (formatDate(data))
  },
  "Dose": {
    path: ["evidence", "0", "dose"],
    format: (data) => (data)
  },
  "Total Doses": {
    path: ["evidence", "0", "totalDoses"],
    format: (data) => (data)
  },
  "Vaccination Facility": {
    path: ["evidence", "0", "facility", "name"],
    format: (data) => (data)
  }
};
