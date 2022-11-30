import {useTranslation} from "react-i18next";

function SchemaAttribute(props) {

    const { t } = useTranslation();
    const attributeTypes = [
        {"label": "Text", "value":"string"},
        {"label": "Number", "value":"integer"},
        {"label": "Date/Time", "value":"date"}
    ]
    return(
        <tr>
            <td>
                <input type="text" defaultValue={props.schemaAttribute.label} readOnly={props.schemaAttribute.readOnly}/>
            </td>
            <td>
                <select defaultValue={props.schemaAttribute.type} disabled={props.schemaAttribute.readonly}>
                    {
                        attributeTypes.map(function(attributeType) {
                            return <option value={attributeType.value}>{attributeType.label}</option>
                        })
                    }
                </select>
            </td>
            <td>
                <input type="checkbox" id="mandatoryAttribute" name="mandatoryAttribute" readOnly={props.schemaAttribute.readOnly} checked={props.schemaAttribute.isMandatory}/>
            </td>
            <td>
                <input type="checkbox" id="indexedAttribute" name="indexedAttribute" readOnly={props.schemaAttribute.readOnly} checked={props.schemaAttribute.indexed}/>
            </td>
            <td>
                <input type="checkbox" id="uniqueAttribute" name="uniqueAttribute" readOnly={props.schemaAttribute.readOnly} checked={props.schemaAttribute.unique}/>
            </td>
            <td>
                <input type="text" defaultValue={props.schemaAttribute.description} readOnly={props.schemaAttribute.readOnly}/>
            </td>
        </tr>
    );
}

export default SchemaAttribute;