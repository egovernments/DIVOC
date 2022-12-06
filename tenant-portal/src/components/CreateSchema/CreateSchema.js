import React,{useState}  from "react";
import styles from "./CreateSchema.module.css";
import {useTranslation} from "react-i18next";
import SchemaDetails from "../SchemaDetails/SchemaDetails"
import upload_image from "../../assets/img/upload_image.png";
import addVector from "../../assets/img/add-vector.svg";
import uploadVector from "../../assets/img/upload-vector.svg";
import {  Card, Col, Container , Image, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";

function CreateSchema(){
    const { t } = useTranslation();

    const [schemaDetails, setSchemaDetails] = useState(false);
return (
<div>
    { !schemaDetails && <div>
        <Container fluid="md" className="py-4">
            <Row className="justify-content-between px-5" >
                <Col md={5} >
                    <Stack gap={4}>
                        <Row className={styles["title"]}>{t('createSchema.title')}</Row>
                        <Row className="gx-0">{t('createSchema.text')}</Row>
                        <Col>{t('createSchema.view')} <Link to={''} className="text-decoration-none">{t('createSchema.trainingMaterial')}</Link> {t('createSchema.or')} <Link to={''} class="text-decoration-none">{t('createSchema.videosLink')}</Link></Col>
                        <Row xs={1} sm={2} className="pt-4">
                            <Col>
                                <Card className={styles['card']} onClick={() => setSchemaDetails(true)}>
                                    <Card.Body className="">
                                        <Card.Title className="text-center"><Image src={addVector}/></Card.Title>
                                        <Card.Text className={styles["card-text"]}>{t('createSchema.addText')}</Card.Text>
                                    </Card.Body>
                                </Card> 
                            </Col>
                            <Col>
                                <Link to={''} className="text-decoration-none">
                                    <Card  className={styles['card']}>
                                        <Card.Body className="">
                                            <Card.Title className="text-center"><Image src={uploadVector}/></Card.Title>
                                            <Card.Text className={styles["card-text"]}>{t('createSchema.uploadText')}</Card.Text>
                                        </Card.Body>
                                    </Card> 
                                </Link>
                            </Col>
                        </Row>
                    </Stack>
                    
                </Col>
                <Col md={5}>
                    <Image className="w-100" src={upload_image} />
                </Col>
            </Row>               
        </Container>
    </div>}
    {schemaDetails && <div><SchemaDetails/></div>}
    
</div>
);
}

export default CreateSchema;
