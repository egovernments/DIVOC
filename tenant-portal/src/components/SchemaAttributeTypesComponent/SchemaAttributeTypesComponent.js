import {Container, FormControl} from "react-bootstrap";
import AttributeTypeComponent from "../AttributeTypeComponent/AttributeTypeComponent";
import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {SCHEMA_ATTRIBUTE_TYPES} from "../../constants";

function SchemaAttributeTypesComponent({selectAttributeType}) {
    const {t} = useTranslation();
    const [searchAttributeTypeInput, setSearchAttributeTypeInput] = useState("");
    const filteredData = SCHEMA_ATTRIBUTE_TYPES.filter(attributeType => {
        return !searchAttributeTypeInput || Object.values(attributeType).some(val =>
            val?.toLowerCase().includes(searchAttributeTypeInput?.toLowerCase())
        );
    });
    return (
        <Container>
            <FormControl
                className='search-icon w-100 border border-1 rounded'
                type='text'  id="schemaFieldSearch"
                value={searchAttributeTypeInput}
                placeholder={t('manualSchema.searchPlaceHolder')}
                onChange={(e) => setSearchAttributeTypeInput(e.target.value)}
            />
            <div className='schema-list border-0 p-0 rounded-0'>
                {
                    filteredData.map(attributeType =>
                        <AttributeTypeComponent type={attributeType.type} label={attributeType.label} selectAttributeType={selectAttributeType}></AttributeTypeComponent>
                    )
                }
            </div>
        </Container>
    )
}

export default SchemaAttributeTypesComponent