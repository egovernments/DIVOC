import React  from "react";
import 'react-bootstrap';
import {  Stack, Row, Table, Container } from "react-bootstrap";
import styles from "./SchemaAttributes.module.css";
import GenericButton from "../GenericButton/GenericButton";
import {useTranslation} from "react-i18next";
import {transformSchemaToAttributes} from "../../utils/schema.js"
import Attribute  from "../Attribute/Attribute";

function SchemaAttributes(props){
    const { t } = useTranslation();

    const Attributes = transformSchemaToAttributes(JSON.parse(props.schema));
    return (
        <div>
            <Container>
                <Stack gap={3}>
                    <Row className="title">{props.name}</Row>
                    <Row >{props.description}</Row>
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
            

            <Row className={`${styles['custom-footer']} justify-content-end w-100 gx-1 p-4`} >
                { props.status === "DRAFT" && 
                    <>
                        <GenericButton img={''} text='Save as Draft' type='button' form="schema-attributes" variant='outline-primary' styles={{ width: "15%",marginLeft: "1rem" }} />
                        <GenericButton img={''} text='Save & Next' type='button' form="schema-attributes" variant='primary' styles={{ width: "15%" ,marginLeft: "1rem"}} />
                    </>
                }
                { props.status === "PUBLISHED" && 
                    <GenericButton img={''} text='Back to Manage Schema' type='button' variant='primary' styles={{width:"18%"}}/>
                }
            </Row>
            
        </div>
    ); 
}
export default SchemaAttributes;