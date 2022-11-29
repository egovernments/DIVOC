import React, {useEffect} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Container, Col, Button, Row} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import HomeImg from "../../assets/img/home-img.png";
import styles from './Home.module.css';
import {useTranslation} from "react-i18next";
import config from '../../config.json';
import {useKeycloak} from '@react-keycloak/web'

function Home() {
    const {keycloak} = useKeycloak();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    return(
        <div className="d-flex flex-wrap">
            <div className='col-md-6 col-sm-12 page-content'>
                <div className="m-2">
                    <div className="title">{t('homePage.title')}</div>
                    <div className="text">
                        <div className="mb-2">{t('homePage.text')}</div>
                        <div>{t('homePage.view')} 
                            <a href="#" className="mx-2">{t('homePage.trainingMaterial')}</a>
                            {t('homePage.or')}
                            <a href="#" className="mx-2">{t('homePage.videosLink')}</a>
                        </div>
                    </div>
                </div>
                <Container fluid>
                    <Row gutterX='3' xs={1} sm={2}>
                        <Col className="my-2">
                        <Link to='generate-token' style={{textDecoration: 'none', }}>
                            <Card style={{ cursor: "pointer" }} className={styles['card']}>
                                <Card.Body className="d-grid">
                                    <Card.Title className={styles['card-title']}>{t('homePage.genTokenCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('homePage.genTokenCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </ Link>
                        </Col>
                        <Col className="my-2">
                        <Link to='/tenant-portal/manage-schema' style={{textDecoration: 'none', }}>
                            <Card style={{ cursor: "pointer" }}  className={styles['card']}>
                                <Card.Body className="d-grid">
                                    <Card.Title className={styles['card-title']}>{t('homePage.manageSchemaCard.title')}</Card.Title>
                                    <Card.Text className={styles['card-text']}>{t('homePage.manageSchemaCard.text')}</Card.Text>
                                </Card.Body>
                            </Card> 
                        </Link>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="col-md-6 col-sm-12 text-center">
            <img  className='page-image' src={HomeImg} alt="Home" />
            </div>
        </div>
    );
}

export default Home;