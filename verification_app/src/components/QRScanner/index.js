import React, {Component} from 'react';
import './index.css';
import {scanImageData} from "zbar.wasm";

const SCAN_PERIOD_MS = 100;

function hasGetUserMedia() {
    return !!(
        (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );
}

export default class QRScanner extends Component {
    static defaultProps = {
        className: '',
        height: 1000,
        width: 1000,
        videoConstraints: {
            facingMode: "environment"
        }
    };


    static mountedInstances = [];

    static userMediaRequested = false;

    static scanTimer = null;

    constructor(props) {
        super(props);
        this.state = {
            hasUserMedia: false,
        };
    }

    componentDidMount() {
        if (!hasGetUserMedia()) return;

        QRScanner.mountedInstances.push(this);

        if (!this.state.hasUserMedia && !QRScanner.userMediaRequested) {
            this.requestUserMedia();
        }
        QRScanner.scanTimer = setInterval(() => {
            this.scanBarcode();
        }, SCAN_PERIOD_MS);


    }

    componentWillUpdate(nextProps) {
        if (
            JSON.stringify(nextProps.videoConstraints) !==
            JSON.stringify(this.props.videoConstraints)
        ) {
            this.requestUserMedia();
        }
    }

    componentWillUnmount() {
        clearInterval(QRScanner.scanTimer);
        const index = QRScanner.mountedInstances.indexOf(this);
        QRScanner.mountedInstances.splice(index, 1);

        QRScanner.userMediaRequested = false;
        if (QRScanner.mountedInstances.length === 0 && this.state.hasUserMedia) {
            if (this.stream.getVideoTracks && this.stream.getAudioTracks) {
                this.stream.getVideoTracks().map(track => track.stop());
            } else {
                this.stream.stop();
            }
            window.URL.revokeObjectURL(this.state.src);
        }
    }

    scanBarcode = async () => {

        let canvas = document.createElement('canvas');
        canvas.width = this.props.width;
        canvas.height = this.props.height
        let ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.props.width, this.props.height);
        let data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const symbols = await scanImageData(data);
        scanImageData(data)
        // console.log(symbols, Date.now());
        for (let i = 0; i < symbols.length; ++i) {
            const sym = symbols[i];

            this.props.onScan(sym.decode())
        }

    }


    requestUserMedia() {
        navigator.getUserMedia =
            navigator.mediaDevices.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        const sourceSelected = (videoConstraints) => {
            const constraints = {
                video: videoConstraints || true,
            };

            navigator.mediaDevices
                .getUserMedia(constraints)
                .then((stream) => {
                    QRScanner.mountedInstances.forEach(instance =>
                        instance.handleUserMedia(null, stream),
                    );
                })
                .catch((e) => {
                    QRScanner.mountedInstances.forEach(instance =>
                        instance.handleUserMedia(e),
                    );
                });
        };

        if ('mediaDevices' in navigator) {
            sourceSelected(this.props.videoConstraints);
        } else {
            const optionalSource = id => ({optional: [{sourceId: id}]});

            const constraintToSourceId = (constraint) => {
                const deviceId = (constraint || {}).deviceId;

                if (typeof deviceId === 'string') {
                    return deviceId;
                } else if (Array.isArray(deviceId) && deviceId.length > 0) {
                    return deviceId[0];
                } else if (typeof deviceId === 'object' && deviceId.ideal) {
                    return deviceId.ideal;
                }

                return null;
            };

            MediaStreamTrack.getSources((sources) => {

                let videoSource = null;

                sources.forEach((source) => {
                    if (source.kind === 'video') {
                        videoSource = source.id;
                    }
                });


                const videoSourceId = constraintToSourceId(this.props.videoConstraints);
                if (videoSourceId) {
                    videoSource = videoSourceId;
                }

                sourceSelected(
                    optionalSource(videoSource),
                );
            });
        }

        QRScanner.userMediaRequested = true;
    }

    handleUserMedia(err, stream) {
        if (err) {
            this.setState({hasUserMedia: false});
            this.props.onError(err);

            return;
        }

        this.stream = stream;

        try {
            this.video.srcObject = stream;
            this.setState({hasUserMedia: true});
        } catch (error) {
            this.setState({
                hasUserMedia: true,
                src: window.URL.createObjectURL(stream),
            });
        }

    }

    render() {
        return (
            <div id='videoview' style={{maxWidth:"900px"}}>
                <video
                    autoPlay
                    width={"100%"}
                    src={this.state.src}
                    className={this.props.className}
                    playsInline
                    style={this.props.style}
                    ref={(ref) => {
                        this.video = ref;
                    }}
                />
                <canvas id="overlay" width={this.props.width} height={this.props.height}/>
            </div>
        );
    }
}