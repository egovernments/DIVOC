import React, {useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Container, Col, Button, Row} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import HomeImg from "../../assets/img/homeImage.png";
import styles from './Home.module.css';
import {useTranslation} from "react-i18next";
import config from '../../config.json';

function Home() {

    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        navigate(config.urlPath + "/login");
    }, [navigate]);

    return(
        <div className="row mx-5 px-5 my-5">
            <div className="col-md-6">
                <div className="p-2">
                    <div className="title">{t('homePage.title')}</div>
                    <div className="text">
                        <div className="pb-2">{t('homePage.text')}</div>
                        <div>{t('homePage.view')} 
                            <a href="#" className="mx-2">{t('homePage.trainingMaterial')}</a>
                            {t('homePage.or')}
                            <a href="#" className="mx-2">{t('homePage.videosLink')}</a>
                        </div>
                    </div>
                </div>
                <Container fluid>
                    <Row gutterX='3'>
                        <Col>
                        <Link to='/tenant-portal/generate-token' style={{textDecoration: 'none', }}>
                            <Card style={{ cursor: "pointer" }} className={styles['card']}>
                                <Card.Body>
                                    <Card.Title className={styles['card-title']}>{t('homePage.genTokenCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('homePage.genTokenCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </ Link>
                        </Col>
                        <Col>
                        <Link to='/tenant-portal/manage-schema' style={{textDecoration: 'none', }}>
                            <Card style={{ cursor: "pointer" }}  className={styles['card']}>
                                <Card.Body>
                                    <Card.Title className={styles['card-title']}>{t('homePage.manageSchemaCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('homePage.manageSchemaCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Link>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="col-md-6 px-3">
            <img src={HomeImg} alt="Home" />
            </div>
        </div>
    );
}

export default Home;