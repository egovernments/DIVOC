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

const VACCINE_ICD11_MAPPINGS = {
  "COVAXIN": {
    "icd11Code" :"XM1NL1"
  },
  "COVISHIELD": {
    "icd11Code" :"XM5DF6"
  },
  "SPUTNIK_V": {
    "icd11Code" :"XM5DF6"
  },
  "ZYCOV-D": {
    "icd11Code": "XM6AT1"
  }
}

module.exports = {
  ICD11_MAPPINGS,
  VACCINE_ICD11_MAPPINGS
}