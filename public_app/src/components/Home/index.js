import React, {useEffect, useState} from "react";
import {Link, Redirect, useHistory} from "react-router-dom";
import CertificateSmallImg from '../../assets/img/certificate-small.svg'
import CenterSmallImg from '../../assets/img/center-small.svg'
import CertificateImg from '../../assets/img/download-certificate-home.svg'
import VerifyCertificateImg from '../../assets/img/verify-certificate-home.svg'
import SideEffectsBannerImg from '../../assets/img/side-effects-banner-img.png'
import DashboardBannerImg from '../../assets/img/dashboard-banner.png'
import GetVaccinatedImg from '../../assets/img/img-getvaccinated.png'
import enterMobileImg from '../../assets/img/icon-entermobile.svg'
import enrollmentNumberImg from '../../assets/img/icon-enrolmentnumber.svg'
import verifyIdImg from '../../assets/img/icon-verifyid.svg'
import appointmentImg from '../../assets/img/icon-appointment.svg'
import {ButtonBack, ButtonNext, CarouselProvider, Slide, Slider} from "pure-react-carousel";
import {LatestUpdateCard} from "../LatestUpdateCard";
import "./index.css";
import 'pure-react-carousel/dist/react-carousel.es.css';
import {Col, Row} from "react-bootstrap";
import {CustomButton} from "../CustomButton";
import {useKeycloak} from "@react-keycloak/web";
import axios from "axios";
import {PROGRAM_API} from "../../constants";
import {useTranslation} from "react-i18next";

const HomeCard = ({img, title, subtitle, buttonText, buttonOnClick, buttonClassName, backgroundColor}) => (
    <Col lg={4}>
        <div className="d-flex flex-column justify-content-center align-items-center pb-3 pl-4 pr-4 pt-0 mt-3"
             style={{width: "100%", height: "65vh", backgroundColor: backgroundColor, borderRadius: "20px"}}>
            <div className="d-inline-flex justify-content-center" style={{height: "30%"}}>
                {
                    img
                }
            </div>
            <div style={{height: "50%"}}>
                <h4 className="text-center mt-3">{title}</h4>
                <p className="text-center mt-3">{subtitle}</p>
            </div>
            <div style={{height: "20%"}}>
                <CustomButton className={`${buttonClassName}`} onClick={buttonOnClick}>{buttonText}</CustomButton>
            </div>
        </div>

    </Col>
);

const InfoCard = ({img, title, subtitle}) => (
    <Col lg={3} md={6} sm={12} className="pt-3">
        <Row className="justify-content-center">
            <Col className="col-2 pt-2 pb-2" style={{backgroundColor:"#ffffff", maxHeight:"45px", maxWidth:"55px" }}>
                <div>
                 { img }
                </div>
            </Col>
            <Col>
                <p className="mb-1" style={{fontWeight: "bold"}}>{title}</p>
                <p className="info-input">{subtitle}</p>
            </Col>
        </Row>
    </Col>
)

export const Home = () => {
    const history = useHistory();
    const {keycloak} = useKeycloak();
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobileNumberErr, setMobileNumberErr] = useState('');
    const [programs, setPrograms] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        if(keycloak.authenticated) {
            keycloak.logout()
        }
        fetchPrograms()
    }, []);

  function fetchPrograms() {
    axios.get(PROGRAM_API)
      .then(res => {
        if (res.status === 200) {
          setPrograms(res.data);
        }
      })
      .catch(e => {
        console.log(e);
        setPrograms([])
      })
  }

    function buttonLoginOnClick() {
        if (mobileNumber.length < 10 || isNaN(mobileNumber)) {
            setMobileNumberErr(t('errors.invalidMobileNumber'))
        } else {
            history.push({
                pathname: '/citizen',
                state: {mobileNumber}
            })
        }
    }

    return (
        <div className="home-section">
            <div className="section " style={{maxWidth:"1300px", margin:"auto"}}>
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="p-4 p-lg-4 d-flex flex-column justify-content-center align-items-center">
                        <Row className="d-flex justify-content-center mb-3">
                            <Col style={{paddingRight:"10vmin", paddingLeft:"08vmin"}}>
                                <h3 className="mb-5 mt-5" style={{fontWeight:"bold"}}>{t('home.registrationTitle')}</h3>
                                <p className="mb-5" style={{fontSize:"large"}}>{t('home.registrationSubTitle')}</p>
                                <input placeholder={t('home.mobPlaceholder')}
                                       className="form-control form-control-lg"
                                       onChange={(e) => {setMobileNumber(e.target.value)}}
                                       value={mobileNumber}
                                       maxLength={10}
                                />
                                <div hidden={mobileNumberErr} className="info-input">
                                    <p>{t('home.registrationInfo')}</p>
                                </div>
                                <div className="invalid-input">
                                    <p>{mobileNumberErr}</p>
                                </div>
                                <CustomButton className={"blue-btn"} style={{width: "100%"}} onClick={() => buttonLoginOnClick()}>{t('home.login')}</CustomButton>
                            </Col>
                            <Col>
                                <img className="vaccinate-img" src={GetVaccinatedImg} alt={""} />
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
            <div className="section ">
                <div className="info-section d-flex flex-column" style={{height: "100%"}}>
                    <div className="pr-4 pl-4 pr-lg-5 pl-lg-5 d-flex flex-column justify-content-center" style={{margin:"auto"}}>
                        <Row className="d-flex justify-content-center">
                            <InfoCard img={<img src={enterMobileImg} alt={""}/>}
                                      title={t('home.infoCard.0.title')}
                                      subtitle={t('home.infoCard.0.subTitle')}
                            />
                            <InfoCard img={<img src={verifyIdImg} alt={""}/>}
                                      title={t('home.infoCard.1.title')}
                                      subtitle={t('home.infoCard.1.subTitle')}
                            />
                            <InfoCard img={<img src={enrollmentNumberImg} alt={""}/>}
                                      title={t('home.infoCard.2.title')}
                                      subtitle={t('home.infoCard.2.subTitle')}
                            />
                            <InfoCard img={<img src={appointmentImg} alt={""}/>}
                                      title={t('home.infoCard.3.title')}
                                      subtitle={t('home.infoCard.3.subTitle')}
                            />
                        </Row>
                    </div>
                </div>
            </div>
            <div className="section " style={{maxWidth:"1300px", margin:"auto"}}>
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="p-4 p-lg-5 d-flex flex-column justify-content-center align-items-center" style={{margin:"20px"}}>
                        <Row className="d-flex justify-content-center mb-3">
                            <HomeCard img={<img src={CertificateImg} alt={""} width={"80%"}/>}
                                      title={t('home.homeCard.0.title')}
                                      subtitle={t('home.homeCard.0.subTitle')}
                                      buttonText={t('home.homeCard.0.button')}
                                      buttonOnClick={() => {
                                          history.push("/certificate/")
                                      }}
                                      buttonClassName={"blue-btn"}
                                      backgroundColor={"#F8FBFF"}
                            />
                            <HomeCard img={<img src={VerifyCertificateImg} alt={""} width={"80%"}/>}
                                      title={t('home.homeCard.1.title')}
                                      subtitle={t('home.homeCard.1.subTitle')}
                                      buttonText={t('home.homeCard.1.button')}
                                      buttonOnClick={() => {
                                          history.push("/verify-certificate/")
                                      }}
                                      buttonClassName="green-btn"
                                      backgroundColor={"#F2FAF6"}
                            />

                            <HomeCard img={<img src={SideEffectsBannerImg} alt={""} width={"60%"}/>}
                                      title={t('home.homeCard.2.title')}
                                      subtitle={t('home.homeCard.2.subTitle')}
                                      buttonText={t('home.homeCard.2.button')}
                                      buttonOnClick={() => {
                                          history.push("/side-effects")
                                      }}
                                      buttonClassName={"yellow-btn"}
                                      backgroundColor={"#FFFBF0"}
                            />
                        </Row>
                    </div>
                </div>
            </div>
            <div hidden={!programs || programs.length === 0} className="section ">
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="ml-3 pb-4 pb-lg-5 d-flex flex-column justify-content-center align-items-center">
                        <h3 style={{fontWeight:"bold"}}>{t('home.onGoingProgramTitle')}</h3>
                    </div>
                </div>
            </div>
            <div className="section " style={{maxWidth:"1300px", margin:"auto"}}>
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="pr-4 pl-4 pr-lg-5 pl-lg-5 d-flex flex-column justify-content-center">
                        <Row className="justify-content-center">
                        {
                            programs.map(p =>
                                <Col lg={6} >
                                    <div className="p-4 mb-4" style={{backgroundColor:"#F9FAFA", borderRadius: "10px"}}>
                                        <h4 className="pb-2" style={{fontWeight:"bold"}}>{p.name}</h4>
                                        <p className="info-input">{p.description}</p>
                                    </div>
                                </Col>
                            )
                        }
                        </Row>
                    </div>
                </div>
            </div>
            <div className="updates-section p-3 p-lg-0 d-none">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="font-weight-bold">Latest Updates</span>
                    <span className="d-flex align-items-center" style={{cursor: "pointer"}}>View All Updates <span
                        className="latest-update-nav-btn ml-2 pl-1 pr-1">{">"}</span></span>
                </div>
                <CarouselProvider
                    naturalSlideWidth={100}
                    naturalSlideHeight={40}
                    totalSlides={3}
                    visibleSlides={window.innerWidth < 1000 ? 1 : 2}
                >
                    <Slider>
                        <Slide index={0}>
                            <LatestUpdateCard/>
                        </Slide>
                        <Slide index={1}><LatestUpdateCard/></Slide>
                        <Slide index={2}><LatestUpdateCard/></Slide>
                    </Slider>
                    <ButtonNext className="latest-update-nav-btn float-right mt-3 ml-1">{">"}</ButtonNext>
                    <ButtonBack className="latest-update-nav-btn float-right mt-3 ml-1">{"<"}</ButtonBack>
                </CarouselProvider>
            </div>
        </div>
    );
}
