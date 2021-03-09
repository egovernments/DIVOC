import React, {useEffect, useState} from "react";
import {Link, Redirect, useHistory} from "react-router-dom";
import CertificateSmallImg from '../../assets/img/certificate-small.svg'
import CenterSmallImg from '../../assets/img/center-small.svg'
import CertificateImg from '../../assets/img/download-certificate-home.svg'
import VerifyCertificateImg from '../../assets/img/verify-certificate-home.svg'
import SideEffectsBannerImg from '../../assets/img/side-effects-banner-img.png'
import DashboardBannerImg from '../../assets/img/dashboard-banner.png'
import GetVaccinatedImg from '../../assets/img/img-getvaccinated.png'
import Covid19PgmImg from '../../assets/img/covid19program.svg'
import {ButtonBack, ButtonNext, CarouselProvider, Slide, Slider} from "pure-react-carousel";
import {LatestUpdateCard} from "../LatestUpdateCard";
import "./index.css";
import 'pure-react-carousel/dist/react-carousel.es.css';
import {Col, Row} from "react-bootstrap";
import {CustomButton} from "../CustomButton";
import {useKeycloak} from "@react-keycloak/web";

const HomeCard = ({img, title, subtitle, buttonText, buttonOnClick, buttonClassName, backgroundColor}) => (
    <Col lg={3}>
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
)

export const Home = () => {
    const history = useHistory();
    const {keycloak} = useKeycloak();
    const [mobileNumber, setMobileNumber] = useState('');

    useEffect(() => {
        if(keycloak.authenticated) {
            keycloak.logout()
        }
    }, []);

    function buttonLoginOnClick() {
        history.push({
            pathname: '/citizen',
            state: {mobileNumber}
        })
    }

    return (
        <div className="home-section">
            <div className="section ">
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="p-4 p-lg-5 d-flex flex-column justify-content-center align-items-center">
                        <Row className="d-flex justify-content-center mb-3">
                            <Col style={{paddingRight:"20vh", paddingLeft:"10vh"}}>
                                <h3 className="mb-5 mt-5" style={{fontWeight:"bold"}}>Register for vaccination program</h3>
                                <p className="mb-5" style={{fontSize:"large"}}>Enter your mobile number and book an appointment at your nearest facility center</p>
                                <input placeholder="Enter mobile number"
                                       className="form-control form-control-lg"
                                       onChange={(e) => {setMobileNumber(e.target.value)}}
                                       value={mobileNumber}
                                       maxLength={10}
                                />
                                <div className="info-input">
                                    <p>An OTP will be sent to you for verification</p>
                                </div>
                                <CustomButton className={"blue-btn"} style={{width: "100%"}} onClick={() => buttonLoginOnClick()}>Log In</CustomButton>
                            </Col>
                            <Col>
                                <img src={GetVaccinatedImg} alt={""} style={{height:"70vh"}}/>
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-center mb-3">
                            <HomeCard img={<img src={CertificateImg} alt={""} width={"80%"}/>}
                                      title={"Download your Vaccination Certificate"}
                                      subtitle={"You would need your unique id and Mobile number to verify OTP in order to access your digital certificate."}
                                      buttonText={"Download"}
                                      buttonOnClick={() => {
                                          history.push("/certificate/")
                                      }}
                                      buttonClassName={"blue-btn"}
                                      backgroundColor={"#F8FBFF"}
                            />
                            <HomeCard img={<img src={VerifyCertificateImg} alt={""} width={"80%"}/>}
                                      title={"Verify your Vaccination Certificate"}
                                      subtitle={"Ensure that your vaccination certificate is a authentic by digitally verifying it here."}
                                      buttonText={"Verify"}
                                      buttonOnClick={() => {
                                          history.push("/verify-certificate/")
                                      }}
                                      buttonClassName="green-btn"
                                      backgroundColor={"#F2FAF6"}
                            />

                            <HomeCard img={<img src={SideEffectsBannerImg} alt={""} width={"60%"}/>}
                                      title={"Report symptoms"}
                                      subtitle={"By reporting any side-effects of the vaccine, you will ensure the safety of others in the community and help the government contain the pandemic effectively."}
                                      buttonText={"Report Side-effects"}
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
