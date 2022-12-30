const SCHEMA_PAYLOAD = {
    schemaName : "schema_name",
    schemaDescription : "schema_description",
    credentialTemplate : {
        context: ["context1"]
    },
    certificateTemplates: {
        html : "template1"
    },
    Attributes :  [
        {
            "label": "issuanceDate",
            "type": "string",
            "isMandatory": true,
            "isIndexField": false,
            "isUniqueIndex": false,
            "description": "Date certificate issued on",
            "readOnly": true,
            "editMode": false,
            "isIdentityInformation": false
        },
        {
            "label": "issuer",
            "type": "string",
            "isMandatory": true,
            "isIndexField": false,
            "isUniqueIndex": false,
            "description": "Name of the issuing authority",
            "readOnly": true,
            "editMode": false,
            "isIdentityInformation": false
        },
        {
            "label": "certificateId",
            "type": "string",
            "isMandatory": true,
            "isIndexField": true,
            "isUniqueIndex": true,
            "description": "The unique Certificate ID",
            "readOnly": true,
            "editMode": false,
            "isIdentityInformation": false
        },
        {
            "label": "validTill",
            "type": "string",
            "isMandatory": false,
            "isIndexField": false,
            "isUniqueIndex": false,
            "description": "The date from which the credential is valid from",
            "readOnly": true,
            "editMode": false,
            "isIdentityInformation": false
        },
        {
            "label": "validTill",
            "type": "string",
            "isMandatory": false,
            "isIndexField": false,
            "isUniqueIndex": false,
            "description": "The date until which the credential is valid to",
            "readOnly": true,
            "editMode": false,
            "isIdentityInformation": false
        }
    ]
}

const INBUILT_ATTRIBUTES =  [
    {
        "label": "issuanceDate",
        "type": "string",
        "isMandatory": true,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "Date certificate issued on",
        "readOnly": true,
        "editMode": false,
        "isIdentityInformation": false
    },
    {
        "label": "issuer",
        "type": "string",
        "isMandatory": true,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "Name of the issuing authority",
        "readOnly": true,
        "editMode": false,
        "isIdentityInformation": false
    },
    {
        "label": "certificateId",
        "type": "string",
        "isMandatory": true,
        "isIndexField": true,
        "isUniqueIndex": true,
        "description": "The unique Certificate ID",
        "readOnly": true,
        "editMode": false,
        "isIdentityInformation": false
    },
    {
        "label": "validFrom",
        "type": "string",
        "isMandatory": false,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "The date from which the credential is valid from",
        "readOnly": true,
        "editMode": false,
        "isIdentityInformation": false
    },
    {
        "label": "validTill",
        "type": "string",
        "isMandatory": false,
        "isIndexField": false,
        "isUniqueIndex": false,
        "description": "The date until which the credential is valid to",
        "readOnly": true,
        "editMode": false,
        "isIdentityInformation": false
    }
]
const SAMPLE_TEMPLATE_WITH_QR = 'https://gist.githubusercontent.com/saiprakash-v/c5aa3d97de95806669b4ea26ec54bd55/raw/9f38b9c6d3e458e7facb658dbb3cb661af9664fb/templateWithOnlyQR.html'
const W3C_CONTEXT = "https://www.w3.org/2018/credentials/v1"
const STANDARD_ATTRIBUTES = [
    "certificateId",
    "validFrom",
    "validTill",
    "issuer",
    "issuanceDate"
]
const ATTRIBUTE_MODIFY_ACTIONS = {
    "DELETE": "delete",
    "EDIT": "edit",
    "UPDATE": "update",
    "CANCEL": "cancel"
}
const VC_MANAGEMENT_SWAGGER_URL = 'vc-management/api-docs';
const DRAG_AND_DROP_TYPE = 'attributeType';
const ATTRIBUTE_DATA_TYPES = {
    "STRING": "string",
    "INTEGER": "integer",
    "ENUM": "enum",
    "BOOLEAN": "boolean"
}
const SCHEMA_ATTRIBUTE_TYPES = [
    {
        "type": ATTRIBUTE_DATA_TYPES.STRING,
        "label": "Text Field"
    },
    {
        "type": ATTRIBUTE_DATA_TYPES.INTEGER,
        "label": "Integer"
    },
    {
        "type": ATTRIBUTE_DATA_TYPES.ENUM,
        "label": "Select boxes"
    },
    {
        "type": ATTRIBUTE_DATA_TYPES.BOOLEAN,
        "label": "Boolean"
    }
];
const SCHEMA_STATUS = {
    "DRAFT": "DRAFT",
    "INPROGRESS": "INPROGRESS",
    "PUBLISHED": "PUBLISHED"

}
const SCHEMA_BODY = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "type": "object",
    "properties": {
        "{{schemaName}}": {
            "$ref": "#/definitions/{{schemaName}}"
        }
    },
    "required": [
        "{{schemaName}}"
    ],
    "title": "{{schemaName}}",
    "definitions": {
        "{{schemaName}}": {
            "type": "object",
            "title": "{{schemaDescription}}",
            "required": [],
            "properties": {}
        }
    },
    "_osConfig": {
        "uniqueIndexFields": [],
        "indexFields": [],
        "ownershipAttributes": [],
        "roles": [],
        "inviteRoles": [],
        "credentialTemplate": {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": [
                "VerifiableCredential",
                "ProofOf{{schemaName}}Credential"
            ],
            "credentialSubject": {
                "type": "Person"
            },
            "issuer": "{{{issuer}}}",
            "issuanceDate": "{{issuanceDate}}",
            "evidence": {
                "type": "{{schemaName}}"
            },
            "nonTransferable": "true"
        },
        "certificateTemplates": "{{certificateTemplates}}"
    }
};

const CONTEXT_BODY = {
    "@context": {
        "@version": 1.1,
        "@protected": true,
        "id": "@id",
        "type": "@type",
        "schema": "https://schema.org/",
        "vc": "https://council.gov.in/credentials/{{schemaName}}/v1",
        "ProofOf{{schemaName}}Credential":{
            "@id": "schema:ProofOf{{schemaName}}Credential",
            "@context": {
                "@version": 1.1,
                "@protected": true,
                "nonTransferable": "vac:nonTransferable"
            }
        },
        "Person": {
            "@id": "schema:Person",
            "@context": {
                "@version": 1.1,
                "@protected": true
            }
        },
        "{{schemaName}}": {
            "@id": "vc:{{schemaName}}",
            "@context": {
                "@version": 1.1,
                "@protected": true,
            }
        }
    }
}
export {
    INBUILT_ATTRIBUTES,
    STANDARD_ATTRIBUTES,
    VC_MANAGEMENT_SWAGGER_URL,
    DRAG_AND_DROP_TYPE,
    SCHEMA_ATTRIBUTE_TYPES,
    ATTRIBUTE_DATA_TYPES,
    SCHEMA_STATUS,
    SCHEMA_PAYLOAD,
    SCHEMA_BODY,
    CONTEXT_BODY,
    SAMPLE_TEMPLATE_WITH_QR,
    W3C_CONTEXT,
    ATTRIBUTE_MODIFY_ACTIONS
}