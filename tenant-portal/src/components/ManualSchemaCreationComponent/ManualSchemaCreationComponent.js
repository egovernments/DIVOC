import SchemaDetails from "../SchemaDetails/SchemaDetails";
import React, {useState} from "react";
import AddSchemaFieldComponent from "../AddSchemaFieldComponent/AddSchemaFieldComponent";
import SchemaAttributes from "../SchemaAttributes/SchemaAttributes";
import {ATTRIBUTE_MODIFY_ACTIONS, INBUILT_ATTRIBUTES, SCHEMA_STATUS} from "../../constants";
import TestAndPublish from "../TestAndPublish/TestAndPublish";
import BreadcrumbComponent from "../BreadcrumbComponent/BreadcrumbComponent";

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
            schemaDetails["properties"] = INBUILT_ATTRIBUTES;
        }
        schemaDetails["properties"].push(attr);
        setSchemaDetails({...schemaDetails});
        setViewSchemaDetails(true);
        setCreateAttribute(false);
    }


    const createNewFieldInSchema = () => {
        setViewSchemaDetails(false);
        setCreateAttribute(true);
    }
    const modifyAttribute = (index, action, newDetails) => {
        switch (action) {
            case ATTRIBUTE_MODIFY_ACTIONS.DELETE:
                schemaDetails["properties"].splice(index, 1);
                setSchemaDetails({...schemaDetails});
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.EDIT:
                schemaDetails["properties"][index].editMode = true;
                setSchemaDetails({...schemaDetails});
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.UPDATE:
                for (const [key, value] of Object.entries(newDetails)) {
                    schemaDetails["properties"][index][key]=value;
                }
                schemaDetails["properties"][index].editMode = false;
                setSchemaDetails({...schemaDetails});
                break;
            case ATTRIBUTE_MODIFY_ACTIONS.CANCEL:
                schemaDetails["properties"][index].editMode = false;
                setSchemaDetails({...schemaDetails});
                break;
            default:
                console.log("Invalid action");
        }
    }

    return (
        <div>
            {!createAttribute && <BreadcrumbComponent showBreadCrumb={true} />}
            {
                !initialDetailsCreated && !schemaPreview &&
                <SchemaDetails addInitialSchemaDetails={updateInitialSchemaDetails}></SchemaDetails>
            }
            {
                initialDetailsCreated && createAttribute && !schemaPreview &&
                <AddSchemaFieldComponent addNewAttributeToSchema={addNewAttributeToSchema}></AddSchemaFieldComponent>
            }
            {
                !createAttribute && viewSchemaDetails && !schemaPreview &&
                <SchemaAttributes
                    schemaDetails={schemaDetails}
                    attributes={schemaDetails["properties"]}
                    setschemaPreview={setSchemaPreview}
                    setUpdatedSchema={setUploadedSchema}
                    modifyAttribute={modifyAttribute}
                    createNewFieldInSchema={createNewFieldInSchema}></SchemaAttributes>
            }
            {
                schemaPreview &&
                <div>
                    <TestAndPublish schema={uploadedSchema} setSchemaPreview={setSchemaPreview}/>
                </div>
            }
        </div>
    )
}

export default ManualSchemaCreationComponent