import React from 'react';
import PropTypes from 'prop-types';
import "./index.css"
import {Col, Row} from "react-bootstrap";
import FeedbackSmallImg from "../../assets/img/feedback-small.png";
import VerifyCertificateImg from "../../assets/img/verify-certificate-small.png";
import DownloadImg from "../../assets/img/download-certificate-small.png";
import {SmallInfoCards} from "../CertificateStatus";
import {useHistory} from "react-router-dom";
import VideoThumbnailImg from "../../assets/img/video_static_thumbnail.png";

Learn.propTypes = {};

class VideoDetails {
    constructor(name, imageUrl, description) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
    }
}

const srcPath = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";


const videoDetails = [
    new VideoDetails("A", VideoThumbnailImg, "Description one goes here"),
    new VideoDetails("B", VideoThumbnailImg, "Description two goes here"),
    new VideoDetails("C", VideoThumbnailImg, "Description three goes here")
]

function Learn(props) {
    const history = useHistory();
    return (
        <div className="message-player">

            <div className="half-section  d-lg-flex p-3 p-lg-0">

                <div className="divoc-info-wrapper">
                    <h3 className="text-center mt-3 text-lg-left">Information about C- 19 Vaccination</h3>
                    <span className="text-center  text-lg-left">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</span>
                </div>
                <div className="divoc-video-wrapper">
                    {/*<h3 className="text-center mt-3 text-lg-left">COVID-19 Video</h3>*/}
                    <iframe width="100%"
                            height="100%"
                            src={srcPath}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen/>

                </div>
            </div>
            {
                videoDetails.map((item, index) => {
                    return <RelateVideo videoDetails={item}/>
                })
            }
            <SmallInfoCards
                text={"Provide Feedback"}
                img={FeedbackSmallImg}
                backgroundColor={"#FFFBF0"}/>
            <SmallInfoCards
                text={"Download Certificate"}
                img={DownloadImg}
                onClick={() => {
                    history.push("/certificate/")
                }}
                backgroundColor={"#EFF5FD"}/>
            <SmallInfoCards
                text={"Verify Certificate"}
                img={VerifyCertificateImg}
                onClick={() => {
                    history.push("/verify-certificate/")
                }}
                backgroundColor={"#F2FAF6"}/>
        </div>
    );
}

RelateVideo.propType = {
    videoDetails: PropTypes.instanceOf(VideoDetails)
}

function RelateVideo({videoDetails}) {
    return (
        <Row className="related-video">
            <Col xs={3} className="related-image">
                <img src={videoDetails.imageUrl}
                     alt={""}/>
            </Col>
            <Col xs={7} className="related-text">
                <h6>{videoDetails.description}</h6>
            </Col>
        </Row>
    );
}

export default Learn;
