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
import PlayIconImg from "../../assets/img/message-play.svg";

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

            <div className="video-section  d-lg-flex flex-column p-lg-0">

                <div className="video-info-wrapper p-3">
                    <h4 className="text-center mt-3 text-lg-left">Information about C- 19 Vaccination</h4>
                    <span className="text-center  text-lg-left">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span>
                </div>
                <h4 className="text-center mt-3 text-lg-left">COVID-19 Video</h4>
                <div className="video-wrapper">
                    <iframe width="100%"
                            height="100%"
                            src={srcPath}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen/>

                </div>
                <div className="related-video p-3">
                    {
                        videoDetails.map((item, index) => {
                            return <RelateVideo videoDetails={item}/>
                        })
                    }
                </div>
            </div>

            <div className="m-4">
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
        </div>
    );
}

RelateVideo.propType = {
    videoDetails: PropTypes.instanceOf(VideoDetails)
}

function RelateVideo({videoDetails}) {
    return (
        <div className="related-video-item d-flex flex-row mb-4">
            <Col xs={5} className="related-image">
                <img src={videoDetails.imageUrl}
                     alt={""}/>
                <img className="play-icon" src={PlayIconImg}
                     alt={""}/>

            </Col>
            <Col xs={5} className="related-text">
                <h6>{videoDetails.description}</h6>
            </Col>
        </div>
    );
}

export default Learn;
