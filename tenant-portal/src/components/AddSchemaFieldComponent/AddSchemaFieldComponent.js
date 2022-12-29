import {Col, Row} from "react-bootstrap";
import SchemaAttributeTypesComponent from "../SchemaAttributeTypesComponent/SchemaAttributeTypesComponent";
import AttributeDetailsComponent from "../AttributeDetailsComponent/AttributeDetailsComponent";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {useState} from "react";

function AddSchemaFieldComponent({addNewAttributeToSchema}) {
    const [selectedType, setSelectedType] = useState("");
    const [selectedLabel, setSelectedLabel] = useState("");
    const selectAttributeType = (type, label) => {
        setSelectedType(type);
        setSelectedLabel(label);
    }
    const removeSelectedType = () => {
        setSelectedType("");
    }

    return (
        <div className="d-flex position-absolute h-75 w-100 border-top">
            <DndProvider backend={HTML5Backend}>
                <Col className="col-3 pt-3 border-end">
                    <SchemaAttributeTypesComponent selectAttributeType={selectAttributeType}></SchemaAttributeTypesComponent>
                </Col>
                <Col className="col-9 pt-3">
                    <AttributeDetailsComponent
                        selectedAttributeType={selectedType}
                        selectedAttributeLabel={selectedLabel}
                        removeSelectedType={removeSelectedType}
                        addNewAttributeToSchema={addNewAttributeToSchema}>
                    </AttributeDetailsComponent>
                </Col>
            </DndProvider>
        </div>
    )
}

export default AddSchemaFieldComponent;