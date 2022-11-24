import React from "react";
import "./index.css";
import success_img from "../../assets/img/successful-image.png";
import revoke_img from "../../assets/img/revoked-image.png";
import suspend_img from "../../assets/img/suspension-image.png";
import invalid_img from "../../assets/img/invalid-image.png";

function Info() {
    return (
        <div class="mt-5 p-3 mb-5 container">
            <p>
                The DIVOC issued Verifiable Certificate has a digitally signed
                secure QR code.This can be authenticated online using the verification utility
                in this portal.
            </p>
            <h6 style={{color: "rgb(100, 109, 130)"}}>Steps for online verification:</h6>
            <ol class="verify-steps">
                <li>Visit <a href="https://verify.divoc.org/">https://verify.divoc.org/</a></li>
                <li>Click on <b>“Scan QR”</b> code</li>
                <li>A notification will prompt to activate your device’s camera. Point the camera to the QR code.</li>
                <li>Please keep the following points in mind while scanning the QR code</li>
                <ol class="success-verify" type="a">
                    <li>QR code should cover at-least 70%-80% of screen</li>
                    <li>Complete QR code should be part of camera frame</li>
                    <li>QR code should be parallel to the camera</li>
                    <li>Camera should be hold steadily for at-least 5 seconds</li>
                </ol>
                <li>If camera is unable to read the QR code within 45 seconds, a message - <b>“Camera is not able to read the QR code, please try again”</b> with a try again button will be displayed. Verifier will be required to scan the QR code again following the instructions mentioned in Step 2.</li>
                <li>On successful verification, the following will be displayed on the screen.(Refer to the image on the side)</li>
                
                <div class="row">
                    <div class="col">
                    <li>Message <b>“Certificate Successfully Verified”</b></li>
                    <li>Some of the attributes that will be displayed includes,but not limited are:</li>
                        <ul class="success-verify">
                            <li>Name -</li>
                            <li>Certificate Issued On -</li>
                            <li>Certificate ID -</li>
                            <li>Valid From -</li>
                            <li>Valid To -</li>
                            <li>Issuer -</li>
                        </ul>
                    </div>
                    <div class="col">
                        <img src={success_img} alt="" />

                    </div>
                </div>
                <li>Incase of an unsuccessfull verification if the certificate is not genuine or is suspended, screen will show the message <b>Certificate Invalid</b> or <b>Certificate Suspended</b> respectively. Refer to the images below.</li>
                <li>You can view a video of 'how to verify' <a href="#">here</a> </li>
                <div class="row">
                    <div class="col">
                        <img src={suspend_img} alt="" />
                    </div>
                    <div class="col">
                        <img src={revoke_img} alt="" />
                    </div>
                    <div class="col">
                        <img src={invalid_img} alt="" />
                    </div>
                </div>
            </ol>
        </div>
    );
}

export default Info;
