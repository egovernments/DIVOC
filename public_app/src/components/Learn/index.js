import React from 'react';
import PropTypes from 'prop-types';
import "./index.css"
import {Col} from "react-bootstrap";
import FeedbackSmallImg from "../../assets/img/feedback-small.png";
import VerifyCertificateImg from "../../assets/img/verify-certificate-small.png";
import {SmallInfoCards} from "../CertificateStatus";
import {useHistory} from "react-router-dom";
import VideoThumbnailImg from "../../assets/img/video_static_thumbnail.png";
import PlaceHolderOneThumbnailImg from "../../assets/img/placeholder_image_1.png";
import PlaceHolderTwoThumbnailImg from "../../assets/img/placeholder_image_2.png";
import PlaceHolderThreeThumbnailImg from "../../assets/img/placeholder_image_3.png";
import PlayIconImg from "../../assets/img/message-play.svg";

Learn.propTypes = {};

class VideoDetails {
    constructor(name, imageUrl, description) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
    }
}

const videoDetails = [
    new VideoDetails("B", PlaceHolderTwoThumbnailImg, "कोरोना वैक्‍सीन आपको कब और कैसे मिलेगी?"),
    new VideoDetails("C", PlaceHolderThreeThumbnailImg, "कोरोना के टीकाकरण के लिए दिशा-निर्देश जारी.."),
    new VideoDetails("A", PlaceHolderOneThumbnailImg, "Guidelines for the drive …")
]

const videoHeaderDetails = {
    title: "Learn about the C-19 Program",
    description: "You can find information about the vaccination program, learn about side-effect and how you access your digital vaccination certificate.",
    videoTitle: "Mobile technology to be used for COVID-19",
    videoUrl: "https://divoc.k8s.sandboxaddis.com/video/learn/vaccination.m4v"
}

function Learn(props) {
    const history = useHistory();
    return (
        <div className="learn-container">
            <div className={"video-container"}>
                <div className="video-section  d-lg-flex p-lg-0">

                    <div className="video-info-wrapper p-3">
                        <h4 className="text-center mt-3 text-lg-left">{videoHeaderDetails.title}</h4>
                        <span className="text-center  text-lg-left">{videoHeaderDetails.description}</span>
                    </div>
                    <h4 className="text-center mt-3 ml-3 text-lg-left">{videoHeaderDetails.videoTitle}</h4>
                    <div className="video-wrapper">
                        <iframe width="100%"
                                height="100%"
                                src={videoHeaderDetails.videoUrl}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen/>

                    </div>
                </div>
                <div className="related-video p-3">
                    {
                        videoDetails.map((item, index) => {
                            return <RelateVideo videoDetails={item}/>
                        })
                    }
                </div>
            </div>
            <div className="bottom-container m-4">
                <SmallInfoCards
                    text={"Provide Feedback"}
                    onClick={() => {
                        history.push("/side-effects")
                    }}
                    img={FeedbackSmallImg}
                    backgroundColor={"#FFFBF0"}/>
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
