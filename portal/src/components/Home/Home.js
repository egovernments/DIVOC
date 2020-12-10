import React, {useEffect} from "react";
import './Home.css';
import WelcomeBGImg from '../../assets/img/welcome-bg.png'
import FacilitiesApproveImg from '../../assets/img/facilities-approve.svg'
import FacilitiesViewImg from '../../assets/img/facilities-view.svg'
import FacilitiesMonitorImg from '../../assets/img/facilities-monitor.svg'
import CertificateSmImg from '../../assets/img/certificate-sm.svg'
import CertificateBgImg from '../../assets/img/certificate-bg.svg'
import VideoPlayBtnImg from '../../assets/img/video-play-btn.svg'
import MHFWImg from '../../assets/img/mhfw.png'
import MEITImg from '../../assets/img/meit.png'
import DIImg from '../../assets/img/di.png'
import {ButtonBack, ButtonNext, CarouselProvider, Slide, Slider} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import {LatestUpdateCard} from "../LatestUpdateCard";
import {Link, useHistory} from "react-router-dom";
import {useKeycloak} from "@react-keycloak/web";
import {CONSTANTS} from "../../utils/constants";

export default function Home() {
    const {keycloak} = useKeycloak();
    const history = useHistory();

    useEffect(() => {
        if (keycloak.authenticated) {
            let redirectUrl = "/";
            if (keycloak.hasResourceRole(CONSTANTS.ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = "/admin";
                history.push(redirectUrl)
            } else if (keycloak.hasResourceRole(CONSTANTS.FACILITY_ADMIN_ROLE, CONSTANTS.PORTAL_CLIENT)) {
                redirectUrl = "/facility_admin";
                history.push(redirectUrl)
            }
        }
    }, [keycloak]);
    return (
        <div className="home-section">
            <div className="section ">
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="d-flex welcome-wrapper">
                        <div className="welcome-title-wrapper">
                            <span className="welcome-title">Welcome to the</span><br/>
                            <span className="welcome-subtitle font-weight-bold">Digital Infrastructure for Vaccination & Open Certification Portal</span>
                            <div className="facilities-wrapper pt-4">
                                <span className="font-weight-bold">Facilities can:</span>
                                <div className="d-flex pt-4">
                                    <div className="d-flex align-self-center">
                                        <img alt={""} src={FacilitiesApproveImg} width={40}/>
                                        <span className="pl-1">Approve enrolled Vaccinators</span>
                                    </div>
                                    <div className="d-flex align-self-center">
                                        <img alt={""} src={FacilitiesViewImg} width={40}/>
                                        <span className="pl-1">View Vaccine Allocation by MoHF</span>
                                    </div>
                                    <div className="d-flex align-self-center">
                                        <img alt={""} src={FacilitiesMonitorImg} width={40}/>
                                        <span className="pl-1">Monitor all Vaccination Programs</span>
                                    </div>
                                </div>
                            </div>
                            <Link className="login-button mt-5 d-inline-block" to={"/login"}>Login</Link>
                        </div>
                        <div className="welcome-image-wrapper d-flex justify-content-end">
                            <img alt={""} src={WelcomeBGImg}/>
                        </div>
                    </div>
                    <div className="d-flex certificate-wrapper">
                        <div className="certificate-info-wrapper">
                            <span className="font-weight-bold">Citizens can:</span>
                            <div className="d-flex pt-3 pb-4">
                                <img alt={""} src={CertificateSmImg} width={40}/>
                                <span className="pl-1 pr-5">Download Certificates<br/> Post vaccination</span>
                                <button className="download-certificate-button ">Download Certificate</button>
                            </div>
                            <span className="pt-3">You would need your Aadhaar number and Mobile number to verify OTP in order to access your digital certificate</span>
                        </div>
                        <div className="certificate-img-rapper d-flex justify-content-center align-items-center">
                            <img alt={""} src={CertificateBgImg} width={100}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="half-section  d-flex">
                <div className="divoc-video-wrapper d-flex justify-content-center align-items-center">
                    <iframe width="90%" height="90%" src="https://www.youtube.com/embed/tOuPDAy7r90" frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen></iframe>
                </div>
                <div className="divoc-info-wrapper">
                    <span className="font-weight-bold">What is divoc?</span><br/>
                    <span>DIVOC software specifically addresses the 3rd item above allowing countries to digitally orchestrate rollout across the country using dynamic policies, issuance of digital vaccination certificates that are compliant to international standards, manage post vaccination feedback, and use real time analytics to manage this entire process. DIVOC contains 3 core modules - certificate management, feedback management, and vaccination rollout management - each of which can be used independently or together depending on the need.</span>
                </div>
            </div>
            <div className="updates-section ">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="font-weight-bold">Latest Updates</span>
                    <span className="d-flex align-items-center" style={{cursor: "pointer"}}>View All Updates <span
                        className="latest-update-nav-btn ml-2 pl-1 pr-1">{">"}</span></span>
                </div>
                <CarouselProvider
                    naturalSlideWidth={100}
                    naturalSlideHeight={40}
                    totalSlides={3}
                    visibleSlides={2}
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
            <div className="half-section  d-flex">
                <div className="divoc-video-wrapper d-flex justify-content-center align-items-center">
                    <img alt={""} src={VideoPlayBtnImg} width={40}/>
                </div>
                <div className="divoc-video-wrapper d-flex justify-content-center align-items-center"
                     style={{background: "#5C9EF8"}}>
                    <img alt={""} src={VideoPlayBtnImg} width={40}/>
                </div>
            </div>
            <div className="footer-section">
                <div>
                    <img alt={""} src={MHFWImg} className="footer-gov-logo"/>
                    <img alt={""} src={MEITImg} className="footer-gov-logo"/>
                    <img alt={""} src={DIImg} className="footer-gov-logo"/>
                </div>
                <div>
                    <span className="footer-link">Contact Us</span>
                    <span className="footer-link">Term of use</span>
                    <span className="footer-link">Privacy Policy</span>
                </div>
            </div>
        </div>
    );
}

