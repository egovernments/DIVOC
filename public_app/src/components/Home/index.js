import React from "react";
import {Link} from "react-router-dom";
import CertificateSmallImg from '../../assets/img/certificate-small.svg'
import CenterSmallImg from '../../assets/img/center-small.svg'
import CertificateBigImg from '../../assets/img/certificate-big.png'
import SideEffectsBannerImg from '../../assets/img/side-effects-banner-img.png'
import DashboardBannerImg from '../../assets/img/dashboard-banner.png'
import {ButtonBack, ButtonNext, CarouselProvider, Slide, Slider} from "pure-react-carousel";
import {LatestUpdateCard} from "../LatestUpdateCard";
import "./index.css";
import 'pure-react-carousel/dist/react-carousel.es.css';

export const Home = () => (
    <div className="home-section">
        <div className="section ">
            <div className="d-flex flex-column" style={{height: "100%"}}>
                <div className="d-flex welcome-wrapper">
                    <div className="welcome-title-wrapper">
                        <span className="welcome-title">Welcome to the</span><br/>
                        <span className="welcome-subtitle font-weight-bold">Digital Infrastructure for Vaccination & Open Certification Portal</span>
                        <div className="facilities-wrapper pt-4">
                            <span className="font-weight-bold">Citizens can:</span>
                            <div className="d-flex pt-4">
                                <div className="d-flex align-self-center">
                                    <img alt={""} src={CertificateSmallImg} width={40}/>
                                    <span className="pl-1">Download Certificates<br/> Post vaccination</span>
                                </div>
                                <div className="d-flex align-self-center ml-5">
                                    <Link className="download-certificate-button d-inline-block" to={"/certificate/"}>Download
                                        Certificate</Link>
                                </div>
                            </div>
                        </div>
                        <span className="pt-5 d-inline-block">You would need your Aadhaar number and Mobile number to verify OTP in order to access your digital certificate</span>
                    </div>
                    <div className="welcome-image-wrapper d-flex justify-content-end">
                        <img alt={""} src={CertificateBigImg}/>
                    </div>
                </div>
                <div className="d-flex certificate-wrapper">
                    <div className="certificate-img-rapper d-flex justify-content-center align-items-center">
                        <img alt={""} src={SideEffectsBannerImg} width={"80%"} height={"100%"}/>
                    </div>
                    <div className="certificate-info-wrapper">
                        <span className="font-weight-bold">Provide Feedback</span>
                        <div className="d-flex pt-3 pb-4">
                            <span className="text-right">By reporting any side-effects of the vaccine, you will ensure the safety of others in the community and help the government contain the pandemic effectively.</span>
                        </div>
                        <Link to={"/side_effects"} className="login-button ">Report Side-effects</Link>
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
        <div className="dashboard-section">
            <div className="h-100 pt-5 d-flex flex-column align-items-center justify-content-center">
                <h3>Public Dashboard</h3>
                <span className="pt-3" style={{paddingLeft: "15rem", paddingRight: "15rem"}}>Some introductory text about the dashboard - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</span>
                <div className="w-100 h-100 pt-5">
                    <div className="row h-100 w-100">
                        <div className="col d-flex flex-column justify-content-center align-items-center p-5">
                            <img alt={""} src={CertificateSmallImg} width={40}/>
                            <h4 className="pt-3">Certificates Issued</h4>
                            <h1 className="pt-3 pb-3" style={{fontSize: "50px"}}>7,72,055</h1>
                            <Link to={"/side_effects"} className="outline-button ">View Numbers ></Link>
                        </div>
                        <div className="col">
                            <img alt={""} src={DashboardBannerImg} width={"100%"} height={"100%"}/>
                        </div>
                        <div className="col d-flex flex-column justify-content-center align-items-center p-5">
                            <img alt={""} src={CenterSmallImg} width={40}/>
                            <h4 className="pt-3">Certificates Issued</h4>
                            <b className="pt-3 pb-3" style={{fontSize: "50px"}}>7,72,055</b>
                            <Link to={"/side_effects"} className="outline-button yellow-outline">View Centre details ></Link>
                        </div>
                    </div>
                </div>
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
    </div>
);