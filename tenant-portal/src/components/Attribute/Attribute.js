import {useTranslation} from "react-i18next";
import {standardizeString} from '../../utils/keycloak';

function Attribute(props) {

    const { t } = useTranslation();
    const attributeTypes = [
        {"label": "Text", "value":"string"},
        {"label": "Number", "value":"integer"},
        {"label": "Date/Time", "value":"date"}
    ]
    return(
        <tr className="border-bottom">
            <td>
                {
                    props.schemaAttribute.editMode ? 
                        <input type="text" defaultValue={props.schemaAttribute.label} /> : standardizeString(props.schemaAttribute.label) 
                }
            </td>
            <td>
                {
                    props.schemaAttribute.editMode ? 
                        <select defaultValue={props.schemaAttribute.type}>
                            {
                                attributeTypes.map(function(attributeType) {
                                    return <option value={attributeType.value}>{attributeType.label}</option>
                                })
                            }
                        </select> : props.schemaAttribute.type 
                }
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="mandatoryAttribute" name="mandatoryAttribute" checked={props.schemaAttribute.isMandatory}/>
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="indexedAttribute" name="indexedAttribute" checked={props.schemaAttribute.isIndexField}/>
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="uniqueAttribute" name="uniqueAttribute" checked={props.schemaAttribute.isUniqueIndex}/>
            </td>
            <td>
                {
                    props.schemaAttribute.editMode ? 
                        <input type="text" defaultValue={props.schemaAttribute.description} /> : props.schemaAttribute.description 
                }
            </td>
        </tr>
    );
}

export default Attribute;