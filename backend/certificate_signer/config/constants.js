const ICD11_MAPPINGS = {
  "XM1NL1": {
    "vaccineType": "Inactivated Virus",
    "icd11Term": "COVID-19 vaccine, inactivated virus",
    "disease": "COVID-19"
  },
  "XM5DF6": {
    "vaccineType": "Live attenuated virus",
    "icd11Term": "COVID-19 vaccine, live attenuated virus",
    "disease": "COVID-19"
  },
  "XM0CX4": {
    "vaccineType": "Viral vector (Replicating)",
    "icd11Term": "COVID-19 vaccine, replicating viral vector",
    "disease": "COVID-19"
  },
  "XM0GQ8": {
    "vaccineType": "mRNA",
    "icd11Term": "COVID-19 vaccine, mRNA based vaccine",
    "disease": "COVID-19"
  },
  "XM9QW8": {
    "vaccineType": "Viral vector (Non-replicating)",
    "icd11Term": "COVID-19 vaccine, non-replicating viral vector",
    "disease": "COVID-19"
  },
  "XM6AT1": {
    "vaccineType": "DNA based vaccine",
    "icd11Term": "COVID-19 vaccine, DNA based",
    "disease": "COVID-19"
  },
  "XM5JC5": {
    "vaccineType": "Protein subunit",
    "icd11Term": "COVID-19 vaccine, virus protein subunit",
    "disease": "COVID-19"
  },
  "XM1J92": {
    "vaccineType": "Virus like particle",
    "icd11Term": "COVID-19 vaccine, virus like particle (VLP)",
    "disease": "COVID-19"
  }
};

const VACCINE_ICD11_MAPPINGS = [
  {
    "vaccineName": "covaxin",
    "icd11Code" :"XM1NL1"
  },
  {
    "vaccineName": "covishield",
    "icd11Code" :"XM9QW8"
  },
  {
    "vaccineName": "sputnik",
    "icd11Code" :"XM9QW8"
  },
  {
    "vaccineName": "zycov",
    "icd11Code": "XM6AT1"
  },
  {
    "vaccineName": "covovax",
    "icd11Code": "XM5JC5"
  },
  {
    "vaccineName": "corbevax",
    "icd11Code": "XM5JC5"
  },
  {
    "vaccineName": "novavax",
    "icd11Code": "XM5JC5"
  },
  {
    "vaccineName": "nuvaxovid",
    "icd11Code": "XM5JC5"
  },
  {
    "vaccineName": "spikevax",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "spike vax",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "moderna",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "modema",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "comirnaty",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "pfizer",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "biontech",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "convidecia",
    "icd11Code": "XM9QW8"
  },
  {
    "vaccineName": "janssen",
    "icd11Code": "XM0CX4"
  },
  {
    "vaccineName": "vaxzevria",
    "icd11Code": "XM9QW8"
  },
  {
    "vaccineName": "astrazeneca",
    "icd11Code": "XM9QW8"
  },
  {
    "vaccineName": "covilo",
    "icd11Code": "XM1NL1"
  },
  {
    "vaccineName": "bbibp",
    "icd11Code": "XM1NL1"
  },
  {
    "vaccineName": "sinopharm",
    "icd11Code": "XM1NL1"
  },
  {
    "vaccineName": "coronavac",
    "icd11Code": "XM1NL1"
  },
  {
    "vaccineName": "sinovac",
    "icd11Code": "XM1NL1"
  },
  {
    "vaccineName": "gemcovac",
    "icd11Code": "XM0GQ8"
  },
  {
    "vaccineName": "incovacc",
    "icd11Code": "XM9QW8"
  },
  {
    "vaccineName": "gemcovac®-om",
    "icd11Code": "XM0GQ8"
  }
]

module.exports = {
  ICD11_MAPPINGS,
  VACCINE_ICD11_MAPPINGS
}