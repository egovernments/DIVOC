import {useState,useEffect} from "react";
import {useTranslation} from "react-i18next";
import styles from "./AttributeDetailsComponent.module.css"
import {useDrop} from "react-dnd";
import {ATTRIBUTE_DATA_TYPES, DRAG_AND_DROP_TYPE} from "../../constants";
import {Form, FormControl} from "react-bootstrap";
import addIcon from "../../assets/img/add-icon.svg";
import GenericButton from "../GenericButton/GenericButton";

function AttributeDetailsComponent({selectedAttributeType, selectedAttributeLabel, removeSelectedType, addNewAttributeToSchema}) {
    const {t} = useTranslation();
    const [showAttributeSpecs, setShowAttributeSpecs] = useState(true);
    const [attributeLabel, setAttributeLabel] = useState("");
    const [attributeType, setAttributeType] = useState(selectedAttributeType);
    const [isMandatory, setIsMandatory] = useState(false);
    const [isIndexField, setIsIndexField] = useState(false);
    const [isUniqueIndex, setIsUniqueIndex] = useState(false);
    const [isIdentityInformation, setIsIdentityInformation] = useState(false);
    const [description, setDescription] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [defaultValue, setDefaultValue] = useState("");
    const [enumValues, setEnumValues] = useState([""]);
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: DRAG_AND_DROP_TYPE,
        drop: () => ({ }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));
    const changeEnumValue = (value, index) => {
        enumValues[index] = value;
        setEnumValues([...enumValues]);
    }
    const removeAttributeDetails = () => {
        removeSelectedType();
        setAttributeType("");
        setAttributeLabel("");
        setIsMandatory(false);
        setIsUniqueIndex(false);
        setIsIndexField(false);
        setIsIdentityInformation(false);
        setDescription("");
        setReadOnly(false);
        setEditMode(false);
        setDefaultValue("");
        setEnumValues([""]);
    }
    const saveAttributeDetails = () => {
        addNewAttributeToSchema({
            "label": attributeLabel,
            "type": selectedAttributeType,
            "isMandatory": isMandatory,
            "isIndexField": isIndexField,
            "isUniqueIndex": isUniqueIndex,
            "isIdentityInformation": isIdentityInformation,
            "description": description,
            "readOnly": readOnly,
            "editMode": editMode,
            "defaultValue": defaultValue,
            "enumFields": [...enumValues]
        })
    }
    const addEnum = () => {
        enumValues.push("");
        setEnumValues([...enumValues]);
    }
    useEffect(() => {
        setShowAttributeSpecs(true);
    }, [selectedAttributeType]);
    return (
        <div ref={drop} className="text-center h-100">
            {!selectedAttributeType && <div style={{marginTop: "10rem"}} className={`d-flex flex-column justify-content-center ${styles['info-text']}`}>{t('manualSchema.createAttribute')}</div>}
            {selectedAttributeType &&
                <div className="d-flex flex-column justify-content-center">
                    <div className="px-3 pt-3 pb-5">
                    <p className="title text-start">{selectedAttributeLabel}</p>
                    <div className="shadow-sm px-4 py-3 col-10 col-xl-9">
                        <div className="d-flex align-items-center justify-content-start">
                            <p onClick={() => setShowAttributeSpecs(true)} className={`${styles['section-header']} ${(showAttributeSpecs && (selectedAttributeType === ATTRIBUTE_DATA_TYPES.ENUM)) ? styles['active-heading'] : ''} me-5 cursor-pointer`}>{t('manualSchema.attributeSpecs')}</p>
                            {
                                (selectedAttributeType === ATTRIBUTE_DATA_TYPES.ENUM) &&
                                <p onClick={() => setShowAttributeSpecs(false)} className={`${styles['section-header']} ${!showAttributeSpecs ? styles['active-heading'] : ''} cursor-pointer`}>{t('manualSchema.value')}</p>
                            }
                        </div>
                        {
                            showAttributeSpecs &&
                            <div className="d-flex align-items-start">
                                <Form className="col-6 border-end pe-5 text-start">
                                    <Form.Group className="mb-3" controlId="attributeSpecs.label">
                                        <Form.Label className={styles['input-labels']}>{t('manualSchema.label')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="attributeName"
                                            placeholder={t('manualSchema.labelPlaceHolder')}
                                            value={attributeLabel}
                                            onChange={(e) => {setAttributeLabel(e.target.value)}} />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="attributeSpecs.placeholder">
                                        <Form.Label className={styles['input-labels']}>{t('manualSchema.placeholder')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="attributeDefaultValue"
                                            placeholder={t('manualSchema.defaultValuePlaceHolder')}
                                            value={defaultValue}
                                            onChange={(e) => {setDefaultValue(e.target.value)}}  />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="attributeSpecs.description">
                                        <Form.Label className={styles['input-labels']}>{t('manualSchema.description')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="attributeDescription"
                                            placeholder={t('manualSchema.descriptionPlaceHolder')}
                                            value={description}
                                            onChange={(e) => {setDescription(e.target.value)}} />
                                    </Form.Group>
                                </Form>
                                <Form className="col-6 ps-5 text-start">
                                    <Form.Check
                                        className="mb-3"
                                        label={t('manualSchema.mandatory')}
                                        checked={isMandatory}
                                        type="checkbox"
                                        id="mandatoryAttribute"
                                        onChange={(e) => {setIsMandatory(e.target.checked)}}>
                                    </Form.Check>
                                    <Form.Check
                                        className="mb-3"
                                        label={t('manualSchema.indexed')}
                                        checked={isIndexField}
                                        type="checkbox"
                                        id="indexedAttribute"
                                        onChange={(e) => {setIsIndexField(e.target.checked)}}>
                                    </Form.Check>
                                    <Form.Check
                                        className="mb-3"
                                        label={t('manualSchema.unique')}
                                        checked={isUniqueIndex}
                                        type="checkbox"
                                        id="uniqueAttribute"
                                        onChange={(e) => {setIsUniqueIndex(e.target.checked)}}>
                                    </Form.Check>
                                    <Form.Check
                                        className="mb-3"
                                        label={t('manualSchema.identityInformation')}
                                        checked={isIdentityInformation}
                                        type="checkbox"
                                        id="identityInformationAttribute"
                                        onChange={(e) => {setIsIdentityInformation(e.target.checked)}}>
                                    </Form.Check>
                                </Form>
                            </div>
                        }
                        {
                            !showAttributeSpecs &&
                            <div className="text-start">
                                <p className={styles['input-labels']}>{t('manualSchema.values')}</p>
                                {
                                    enumValues.map((enumValue, index) => {
                                        return <div className="border rounded-1 mb-3">
                                            <p className={`${styles['input-labels']} border-bottom py-2 px-3`}>{t('manualSchema.value')}</p>
                                            <div className="col-5 pb-3 px-3">
                                                <FormControl
                                                    type="text"
                                                    id={`enum${index.toString(10)}`}
                                                    value={enumValue.toString()}
                                                    onChange={(e) => {changeEnumValue(e.target.value, index)}}>
                                                </FormControl>
                                            </div>
                                        </div>
                                    })
                                }
                                <div className="d-flex justify-content-start align-items-center cursor-pointer" onClick={addEnum}>
                                    <img src={addIcon} alt="add icon" className="me-1"/>
                                    <span>{t('manualSchema.addAnother')}</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                    <div className="border-top mb-5">
                        <div className="d-flex justify-content-around col-5 offset-7 p-3">
                            <div className="col-5" onClick={removeAttributeDetails}>
                                <GenericButton img='' text={t('manualSchema.remove')} variant="outline-primary"></GenericButton>
                            </div>
                            <div className="col-5" onClick={saveAttributeDetails}>
                                <GenericButton img='' text={t('manualSchema.save')} variant="primary"></GenericButton>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default AttributeDetailsComponent