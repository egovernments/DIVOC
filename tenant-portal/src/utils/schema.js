import {STANDARD_ATTRIBUTES,SCHEMA_BODY} from "../constants.js"
const Mustache = require("mustache");

function transformSchemaToAttributes (schema) {
    const name = schema.title;
    const properties = schema?.definitions[name]?.properties || {};
    const labels = Object.keys(properties);
    const requiredFields = schema?.definitions[name]?.required || [];
    const indexFields = schema?._osConfig?.indexFields || [];
    const uniqueIndex = schema?._osConfig?.uniqueIndexFields || [];
    const credentialSubject = schema?._osConfig?.credentialTemplate?.credentialSubject

    var Attributes = [];
    labels.map((label) => {
        const attribute = {
            "label": label,
            "type" : properties[label]?.type || "NA",
            "isMandatory": requiredFields.includes(label),
            "isIndexField": indexFields.includes(label),
            "isUniqueIndex": uniqueIndex.includes(label),
            "description" : properties[label]?.description || "NA",
            "readOnly": STANDARD_ATTRIBUTES.findIndex(attr => (attr.toLowerCase() === label.toLowerCase())) !== -1,
            "editMode": false,
            "isIdentityInformation": credentialSubject?.hasOwnProperty(label)
        }
        Attributes.push(attribute)
    })
    return Attributes;
}

function transformAttributesToSchema(schemaPayload,schemaBody){
    //Validate Schema
    const schema = JSON.parse(Mustache.render(JSON.stringify(schemaBody),schemaPayload));
    const name = schemaPayload.schemaName;
    const Attributes = schemaPayload.Attributes;
    Attributes.map((Attribute) =>{
        schema.definitions[name].properties[Attribute.label]={};
        if(Attribute.type === "enum"){
            schema.definitions[name].properties[Attribute.label].type = "string";
            schema.definitions[name].properties[Attribute.label].enum = Attribute?.enumFields;
        }else{
            schema.definitions[name].properties[Attribute.label].type = Attribute.type;
        }
        
        schema.definitions[name].properties[Attribute.label].description = Attribute?.description;
        if (Attribute.isMandatory){
            schema.definitions[name].required.push(Attribute.label);
        }
        if(Attribute.isIndexField){
            schema._osConfig.indexFields.push(Attribute.label);
        }
        if(Attribute.isUniqueIndex){
            schema._osConfig.uniqueIndexFields.push(Attribute.label);   
        }
        if(!Attribute.isIdentityInformation){
            schema._osConfig.credentialTemplate.evidence[Attribute.label] = `{{${Attribute.label}}}`
        }else{
            schema._osConfig.credentialTemplate.credentialSubject[Attribute.label] = `{{${Attribute.label}}}`
        }
    });
    schemaPayload.credentialTemplate.context.map((context)=>{
        schema._osConfig.credentialTemplate["@context"].push(context);
    })
    schema._osConfig.certificateTemplates = schemaPayload.certificateTemplates;
    schema._osConfig.credentialTemplate.issuer = "{{issuer}}";
    schema._osConfig.credentialTemplate.issuanceDate = "{{issuanceDate}}"
    return schema;
}

function transformAttributesToContext(schemaPayload,contextBody){
    const context = JSON.parse(Mustache.render(JSON.stringify(contextBody),schemaPayload));
    const name = schemaPayload.schemaName;
    const Attributes = schemaPayload.Attributes;
    Attributes.map((Attribute) =>{
        if(Attribute.isIdentityInformation){
            if(Attribute.isUniqueIndex){
                context["@context"].Person["@context"][Attribute.label] = "schema:id"
            }else if(Attribute.label.toLowerCase().includes("date")){
                context["@context"].Person["@context"][Attribute.label] = "schema:date"
            }else{
                context["@context"].Person["@context"][Attribute.label] = "schema:Text"
            }
        }else{
            if(Attribute.isUniqueIndex){
                context["@context"][name]["@context"][Attribute.label] = "schema:id"
            }else if(Attribute.label.toLowerCase().includes("date")){
                context["@context"][name]["@context"][Attribute.label] = "schema:date"
            }else{
                context["@context"][name]["@context"][Attribute.label] = "schema:Text"
            }
        }
    });
    return context;
}

export {transformSchemaToAttributes,transformAttributesToSchema,transformAttributesToContext}