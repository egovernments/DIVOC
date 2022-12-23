import React from "react";
import 'react-bootstrap';
import {  Stack, Row, Table, Container,Button, Col } from "react-bootstrap";
import styles from "./SchemaAttributes.module.css";
import GenericButton from "../GenericButton/GenericButton";
import {useTranslation} from "react-i18next";
import {transformSchemaToAttributes} from "../../utils/schema.js"
import Attribute  from "../Attribute/Attribute";
import { Link } from "react-router-dom";
function SchemaAttributes({props, setschemaPreview}){
    const { t } = useTranslation();

    const Attributes = transformSchemaToAttributes(JSON.parse(props.schema));
    return (
        <div>
            <Container>
                <Stack gap={3}>
                    <Row className="title">{props.name}</Row>
                    <Row>{props.description}</Row>
                    <Row className="p-3 border overflow-auto d-xxl-inline-block">
                            <Row className="table-heading py-2">{t('schemaAttributesPage.fields')}</Row>
                            <Table className={styles["SchemaAttributesTable"]}>
                                <thead className="table-col-header">
                                    <th>{t('schemaAttributesPage.label')}</th>
                                    <th>{t('schemaAttributesPage.fieldType')}</th>
                                    <th className="text-center">{t('schemaAttributesPage.mandatory')}</th>
                                    <th className="text-center">{t('schemaAttributesPage.indexed')}</th>
                                    <th className="text-center">{t('schemaAttributesPage.unique')}</th>
                                    <th>{t('schemaAttributesPage.description')}</th>
                                </thead>
                                <tbody>
                                {
                                    Attributes.map((attribute) => {
                                        return <Attribute schemaAttribute={attribute}></Attribute>
                                    })
                                }
                                </tbody>
                            </Table>
                    </Row>
                </Stack>
            </Container>
            <hr className="mt-5 mb-3"/>
                { props.status === "DRAFT" && 
                    <Row gutter='3' xs={1} sm={2} md={4} className="justify-content-end" >
                    <Col onClick={()=> setschemaPreview(true)}>
                        <GenericButton img={''} text='Save as Draft' type='button' form="schema-attributes" variant='outline-primary' />
                     </Col>
                     <Col onClick={()=> setschemaPreview(true)}>
                        <GenericButton img={''} text='Test & Publish' type='button' form="schema-attributes" variant='primary' />
                    </Col>
                    </Row>  
                }
        </div>
    ); 
}
export default SchemaAttributes;