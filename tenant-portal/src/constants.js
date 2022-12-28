const INBUILT_ATTRIBUTES =  [
    {
        "label": "issuanceDate",
        "type": "string",
        "isMandatory": true,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "Date certificate issued on",
        "readOnly": true,
        "editMode": false
    },
    {
        "label": "Issuer",
        "type": "string",
        "isMandatory": true,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "Name of the issuing authority",
        "readOnly": true,
        "editMode": false
    },
    {
        "label": "Certificate ID",
        "type": "string",
        "isMandatory": true,
        "isIndexField": true,
        "isUniqueIndex": true,
        "description": "The unique Certificate ID",
        "readOnly": true,
        "editMode": false
    },
    {
        "label": "Valid From",
        "type": "string",
        "isMandatory": false,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "The date from which the credential is valid from",
        "readOnly": true,
        "editMode": false
    },
    {
        "label": "Valid To",
        "type": "string",
        "isMandatory": false,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "The date until which the credential is valid to",
        "readOnly": true,
        "editMode": false
    }
]

const STANDARD_ATTRIBUTES = [
    "certificateId",
    "validFrom",
    "validTill",
    "issuer",
    "issuanceDate"
]

const VC_MANAGEMENT_SWAGGER_URL = 'vc-management/api-docs';

export {INBUILT_ATTRIBUTES,STANDARD_ATTRIBUTES,VC_MANAGEMENT_SWAGGER_URL}