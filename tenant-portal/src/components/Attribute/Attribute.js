import deleteIcon from '../../assets/img/Delete.svg';
import editIcon from '../../assets/img/Edit.svg';
import doneIcon from '../../assets/img/done.svg';
import cancelIcon from '../../assets/img/cancel.svg';
import {ATTRIBUTE_DATA_TYPES, ATTRIBUTE_MODIFY_ACTIONS, SCHEMA_STATUS} from "../../constants";
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
            <td className="table-text-col">
                {
                    props.schemaAttribute.editMode ? 
                        <input className="py-1 px-2 border rounded-1" type="text" value={label} onChange={(e) => setLabel(e.target.value)} /> : label
                }
            </td>
            <td className="text-center table-text-col">
                {
                    props.schemaAttribute.editMode ? 
                        <select className="py-1 px-2 border rounded-1 bg-white" value={type} onChange={(e) => setType(e.target.value)}>
                            {
                                Object.keys(ATTRIBUTE_DATA_TYPES).map((value) => {
                                    return <option value={ATTRIBUTE_DATA_TYPES[value]}>{ATTRIBUTE_DATA_TYPES[value]}</option>
                                })
                            }
                        </select> : type
                }
            </td>
            <td className="text-center table-check-boxes">
                <input className={props.schemaAttribute.editMode ? "custom-cb editable-cb": "custom-cb"} type="checkbox" id="mandatoryAttribute" name="mandatoryAttribute"
                       checked={isMandatory} onChange={(e) => {props.schemaAttribute.editMode ? setIsMandatory(!isMandatory) : e.preventDefault()}}/>
            </td>
            <td className="text-center table-check-boxes">
                <input className={props.schemaAttribute.editMode ? "custom-cb editable-cb": "custom-cb"} type="checkbox" id="indexedAttribute" name="indexedAttribute"
                       checked={isIndexField} onChange={(e) => {props.schemaAttribute.editMode ? setIsIndexField(!isIndexField) : e.preventDefault()}}/>
            </td>
            <td className="text-center table-check-boxes">
                <input className={props.schemaAttribute.editMode ? "custom-cb editable-cb": "custom-cb"} type="checkbox" id="uniqueAttribute" name="uniqueAttribute"
                       checked={isUniqueIndex} onChange={(e) => {props.schemaAttribute.editMode ? setIsUniqueIndex(!isUniqueIndex) : e.preventDefault()}}/>
            </td>
            <td className="text-center table-check-boxes">
                <input className={props.schemaAttribute.editMode ? "custom-cb editable-cb": "custom-cb"} type="checkbox" id="identityInformation" name="identityInformation"
                       checked={isIdentityInformation}
                       onChange={(e) => {props.schemaAttribute.editMode ? setIsIdentityInformation(!isIdentityInformation) : e.preventDefault()}}/>
            </td>
            <td className="text-center table-text-col">
                {
                    props.schemaAttribute.editMode ? 
                        <input type="text" className="py-1 px-2 border rounded-1" value={description} onChange={(e) => setDescription(e.target.value)}/> : (description || 'NA')
                }
            </td>
            {(props.published !== SCHEMA_STATUS.PUBLISHED) && <td className="text-center table-check-boxes">
                {
                    props.schemaAttribute.readOnly ? (<span>NA</span>) :
                        (
                            props.schemaAttribute.editMode ?
                                (<div className="d-flex justify-content-center align-items-center">
                                    <img src={doneIcon} alt="done icon" style={{width:"23px",height:"23px"}} className="cursor-pointer action-icon me-3" onClick={() => updateAttribute(ATTRIBUTE_MODIFY_ACTIONS.UPDATE)}/>
                                    <img src={cancelIcon} alt="cancel icon" className="cursor-pointer action-icon" onClick={() => props.modifyAttribute(ATTRIBUTE_MODIFY_ACTIONS.CANCEL)}/>
                                </div>) :
                                (<div className="d-flex justify-content-center align-items-center">
                                    <img src={deleteIcon} alt="delete icon" className="cursor-pointer action-icon me-3" onClick={() => props.modifyAttribute(ATTRIBUTE_MODIFY_ACTIONS.DELETE)}/>
                                    <img src={editIcon} alt="edit icon" className="cursor-pointer action-icon" onClick={() => props.modifyAttribute(ATTRIBUTE_MODIFY_ACTIONS.EDIT)}/>
                                </div>)
                        )
                }
            </td>}
        </tr>
    );
}

export default Attribute;