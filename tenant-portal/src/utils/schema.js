import {STANDARD_ATTRIBUTES} from "../constants.js"

function transformSchemaToAttributes (schema) {
    const name = schema.title;
    const properties = schema?.definitions[name]?.properties || {};
    const labels = Object.keys(properties);
    const requiredFields = schema?.definitions[name]?.required || [];
    const indexFields = schema?._osConfig?.indexFields || [];
    const uniqueIndex = schema?._osConfig?.uniqueIndexFields || [];

    var Attributes = [];
    labels.map((label) => {
        const attribute = {
            "label": label,
            "type" : properties[label].type,
            "isMandatory": requiredFields.includes(label),
            "isIndexField": indexFields.includes(label),
            "isUniqueIndex": uniqueIndex.includes(label),
            "description" : properties[label]?.description || "NA",
            "readOnly": STANDARD_ATTRIBUTES.includes(label),
            "editMode": false
        }
        Attributes.push(attribute)
    })
    return Attributes;
}

export {transformSchemaToAttributes}