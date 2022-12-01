export const INBUILT_ATTRIBUTES =  [
    {
        "label": "Name",
        "type": "string",
        "isMandatory": true,
        "indexed": false,
        "unique": false,
        "description": "Name of the holder",
        "readOnly": true
    },
    {
        "label": "Issued on",
        "type": "string",
        "isMandatory": true,
        "indexed": false,
        "unique": false,
        "description": "Date certificate issued on",
        "readOnly": true
    },
    {
        "label": "Issuer",
        "type": "string",
        "isMandatory": true,
        "indexed": false,
        "unique": false,
        "description": "Name of the issuing authority",
        "readOnly": true
    },
    {
        "label": "Certificate ID",
        "type": "string",
        "isMandatory": true,
        "indexed": true,
        "unique": true,
        "description": "The unique Certificate ID",
        "readOnly": true
    },
    {
        "label": "Valid From",
        "type": "string",
        "isMandatory": false,
        "indexed": false,
        "unique": false,
        "description": "The date from which the credential is valid from",
        "readOnly": true
    },
    {
        "label": "Valid To",
        "type": "string",
        "isMandatory": false,
        "indexed": false,
        "unique": false,
        "description": "The date until which the credential is valid to",
        "readOnly": true
    }
]