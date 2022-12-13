import React  from "react";
import 'react-bootstrap';
import { Col, Container, Row, Table } from "react-bootstrap";
import styles from "./SchemaAttributes.module.css";
import GenericButton from "../GenericButton/GenericButton";
import {useTranslation} from "react-i18next";
import Attribute
 from "../Attribute/Attribute";
function SchemaAttributes(props){
    const { t } = useTranslation();

    const parsedSchema = JSON.parse(props.schema);
    return (
        <div>
            <Container>
                <Row className="title gx-0">{props.name}</Row>
                <Row className=" gx-0">{props.description}</Row>
                <Row>
                    <div className="p-3 border overflow-auto d-xxl-inline-block">
                        <p className="table-heading">{t('schemaAttributesPage.fields')}</p>
                        <table className={styles["inbuiltAttributesTable"]}>
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
                                parsedSchema.definitions.properties.map((attribute) => {
                                    return <Attribute schemaAttribute={attribute}></Attribute>
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                </Row>
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