import {useTranslation} from "react-i18next";
import {standardizeString} from '../../utils/customUtils';
import deleteIcon from '../../assets/img/Delete.svg';
import editIcon from '../../assets/img/Edit.svg';
import doneIcon from '../../assets/img/done.svg';
import cancelIcon from '../../assets/img/cancel.svg';
import {ATTRIBUTE_DATA_TYPES, ATTRIBUTE_MODIFY_ACTIONS} from "../../constants";
import {useState} from "react";

function Attribute(props) {

    const [label, setLabel] = useState(props.schemaAttribute.label);
    const [type, setType] = useState(props.schemaAttribute.type);
    const [isMandatory, setIsMandatory] = useState(props.schemaAttribute.isMandatory);
    const [isIndexField, setIsIndexField] = useState(props.schemaAttribute.isIndexField);
    const [isUniqueIndex, setIsUniqueIndex] = useState(props.schemaAttribute.isUniqueIndex);
    const [isIdentityInformation, setIsIdentityInformation] = useState(props.schemaAttribute.isIdentityInformation);
    const [description, setDescription] = useState(props.schemaAttribute.description);
    const updateAttribute = (modifyAction) => {
        const updatedDetails = {
            "label": label,
            "type": type,
            "isMandatory": isMandatory,
            "isIndexField": isIndexField,
            "isUniqueIndex": isUniqueIndex,
            "isIdentityInformation": isIdentityInformation,
            "description": description
        }
        props.modifyAttribute(modifyAction, updatedDetails);
    }
    return(
        <tr className="border-bottom ">
            <td>
                {
                    props.schemaAttribute.editMode ? 
                        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} /> : standardizeString(label)
                }
            </td>
            <td>
                {
                    props.schemaAttribute.editMode ? 
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            {
                                Object.keys(ATTRIBUTE_DATA_TYPES).map((value) => {
                                    return <option value={value}>{value}</option>
                                })
                            }
                        </select> : type
                }
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="mandatoryAttribute" name="mandatoryAttribute" checked={isMandatory} onChange={(e) => setIsMandatory(!isMandatory)}/>
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="indexedAttribute" name="indexedAttribute" checked={isIndexField} onChange={(e) => setIsIndexField(!isIndexField)}/>
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="uniqueAttribute" name="uniqueAttribute" checked={isUniqueIndex} onChange={(e) => setIsUniqueIndex(!isUniqueIndex)}/>
            </td>
            <td className="text-center">
                <input className="custom-cb" type="checkbox" id="identityInformation" name="identityInformation" checked={isIdentityInformation} onChange={(e) => setIsIdentityInformation(!isIdentityInformation)}/>
            </td>
            <td className="text-center">
                {
                    props.schemaAttribute.editMode ? 
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}/> : (description || 'NA')
                }
            </td>
            <td className="text-center">
                {
                    props.schemaAttribute.readOnly ? (<span>NA</span>) :
                        (
                            props.schemaAttribute.editMode ?
                                (<div className="d-flex justify-content-around align-items-center">
                                    <img src={doneIcon} alt="done icon" className="cursor-pointer" onClick={() => updateAttribute(ATTRIBUTE_MODIFY_ACTIONS.UPDATE)}/>
                                    <img src={cancelIcon} alt="cancel icon" className="cursor-pointer" onClick={() => props.modifyAttribute(ATTRIBUTE_MODIFY_ACTIONS.CANCEL)}/>
                                </div>) :
                                (<div className="d-flex justify-content-around align-items-center">
                                    <img src={deleteIcon} alt="delete icon" className="cursor-pointer" onClick={() => props.modifyAttribute(ATTRIBUTE_MODIFY_ACTIONS.DELETE)}/>
                                    <img src={editIcon} alt="edit icon" className="cursor-pointer" onClick={() => props.modifyAttribute(ATTRIBUTE_MODIFY_ACTIONS.EDIT)}/>
                                </div>)
                        )
                }
            </td>
        </tr>
    );
}

export default Attribute;