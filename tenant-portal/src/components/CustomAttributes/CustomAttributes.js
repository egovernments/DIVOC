import React  from "react";
import "./CustomAttributes.css";
import {useTranslation} from "react-i18next";
import upload_image from "../../assets/img/upload_image.png";
import addVector from "../../assets/img/add-vector.svg";
import uploadVector from "../../assets/img/upload-vector.svg";
import {  Card, Col, Container , Image, Row, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";

function AddCustomAttributes(){
    const { t } = useTranslation();

return (
<div>
    <Container fluid="md" className="py-4">
            <Row className="justify-content-between px-5" >
                <Col md={5} >
                    <Stack gap={4}>
                        <Row className="title gx-0">Add Custom Attributes</Row>
                        <Row className="gx-0">Add the custom attributes by selecting one of the options below</Row>
                        <Col>View <Link to={''} className="text-decoration-none">Training Material</Link> or <Link to={''} class="text-decoration-none">videos</Link></Col>
                        <Row xs={1} sm={2} className="pt-4">
                            <Col>
                                <Link to={''} className="text-decoration-none">
                                    <Card className="card">
                                        <Card.Body className="">
                                            <Card.Title className="text-center"><Image src={addVector}/></Card.Title>
                                            <Card.Text className="card-text">Add Manually</Card.Text>
                                        </Card.Body>
                                    </Card> 
                                </ Link>
                            </Col>
                            <Col>
                                <Link to={''} className="text-decoration-none">
                                    <Card  className="card">
                                        <Card.Body className="">
                                            <Card.Title className="text-center"><Image src={uploadVector}/></Card.Title>
                                            <Card.Text className="card-text">Upload JSON</Card.Text>
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
</div>
);
}

export default AddCustomAttributes;
