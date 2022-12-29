import SchemaDetails from "../SchemaDetails/SchemaDetails";
import React, {useState} from "react";
import AddSchemaFieldComponent from "../AddSchemaFieldComponent/AddSchemaFieldComponent";
import SchemaAttributes from "../SchemaAttributes/SchemaAttributes";
import {SCHEMA_STATUS} from "../../constants";
import TestAndPublish from "../TestAndPublish/TestAndPublish";

function ManualSchemaCreationComponent() {
    const [initialDetailsCreated, setInitialDetailsCreated] = useState(false);
    const [createAttribute, setCreateAttribute] = useState(false);
    const [viewSchemaDetails, setViewSchemaDetails] = useState(false);
    const [schemaPreview, setSchemaPreview] = useState(false);
    const [schemaDetails, setSchemaDetails] = useState({"status":SCHEMA_STATUS.INPROGRESS});
    const [uploadedSchema, setUploadedSchema] = useState(null);
    const updateInitialSchemaDetails = (name, description) => {
        schemaDetails["name"] = name;
        schemaDetails["description"] = description;
        setSchemaDetails({...schemaDetails});
        setInitialDetailsCreated(true);
        setCreateAttribute(true);
    }

    const addNewAttributeToSchema = (attr) => {
        if(!schemaDetails["properties"] || !schemaDetails["properties"].length) {
            schemaDetails["properties"] = [];
        }
        schemaDetails["properties"].push(attr);
        setSchemaDetails({...schemaDetails});
        setViewSchemaDetails(true)
    }

    return (
        <div>
            {
                !initialDetailsCreated &&
                <SchemaDetails addInitialSchemaDetails={updateInitialSchemaDetails}></SchemaDetails>
            }
            {
                initialDetailsCreated && createAttribute &&
                <AddSchemaFieldComponent addNewAttributeToSchema={addNewAttributeToSchema}></AddSchemaFieldComponent>
            }
            {
                !createAttribute && viewSchemaDetails &&
                <SchemaAttributes
                    props={schemaDetails}
                    attributes={schemaDetails["properties"]}
                    setschemaPreview={setSchemaPreview}
                    setUpdatedSchema={setUploadedSchema}></SchemaAttributes>
            }
            {
                schemaPreview &&
                <div>
                    <TestAndPublish schema={uploadedSchema}/>
                </div>
            }
        </div>
    )
}

export default ManualSchemaCreationComponent