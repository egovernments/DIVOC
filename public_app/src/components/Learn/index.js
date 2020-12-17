import React from 'react';
import PropTypes from 'prop-types';
import "./index.css"
import {Col, Row} from "react-bootstrap";

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
    new VideoDetails("A", "https://i.picsum.photos/id/875/200/200.jpg?hmac=5faXLEO5BJEKazGrYKfm2NgT97z_7xtPutRkFkPO8Dk", "Description A"),
    new VideoDetails("B", "https://i.picsum.photos/id/942/200/200.jpg?hmac=Gh7W-H3ZGmweB9STLwQvq-IHkxrVyawHVTKYxy-u9mA", "Description B"),
    new VideoDetails("C", "https://i.picsum.photos/id/560/200/200.jpg?hmac=Dqou6QpKCTK2srRsCRhlIxLQHvFL7zz6UocOb3UkpwI", "Description C")
]

function Learn(props) {
    return (
        <div className="message-player">
            <iframe width="100%"
                    height="100%"
                    src={srcPath}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen/>
            {
                videoDetails.map((item, index) => {
                    return <RelateVideo videoDetails={item}/>
                })
            }
        </div>
    );
}

RelateVideo.propType = {
    videoDetails: PropTypes.instanceOf(VideoDetails)
}

function RelateVideo({videoDetails}) {
    return (
        <Row className={"related-video"}>
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
