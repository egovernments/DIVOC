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
                {
                    props.schemaAttribute.readOnly ? props.schemaAttribute.label :
                        <input type="text" defaultValue={props.schemaAttribute.label} readOnly={props.schemaAttribute.readOnly}/>
                }
            </td>
            <td>
                {
                    props.schemaAttribute.readOnly ? props.schemaAttribute.type :
                        <select defaultValue={props.schemaAttribute.type}>
                            {
                                attributeTypes.map(function(attributeType) {
                                    return <option value={attributeType.value}>{attributeType.label}</option>
                                })
                            }
                        </select>
                }
            </td>
            <td className="text-center">
                <input type="checkbox" id="mandatoryAttribute" name="mandatoryAttribute" readOnly={props.schemaAttribute.readOnly} checked={props.schemaAttribute.isMandatory}/>
            </td>
            <td className="text-center">
                <input type="checkbox" id="indexedAttribute" name="indexedAttribute" readOnly={props.schemaAttribute.readOnly} checked={props.schemaAttribute.indexed}/>
            </td>
            <td className="text-center">
                <input type="checkbox" id="uniqueAttribute" name="uniqueAttribute" readOnly={props.schemaAttribute.readOnly} checked={props.schemaAttribute.unique}/>
            </td>
            <td>
                {
                    props.schemaAttribute.readOnly ? props.schemaAttribute.description :
                        <input type="text" defaultValue={props.schemaAttribute.description} readOnly={props.schemaAttribute.readOnly}/>
                }
            </td>
        </tr>
    );
}

export default SchemaAttribute;