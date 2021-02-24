import {useState} from "react";
import './citized-login.css'
import axios from "axios";
import {setCookie} from "../utils/cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../constants";

export function CitizenLoginComponent() {
    const [state, setState] = useState({
        phoneNumber: "",
        otp: "",
        showOnlyOTP: true,
        invalidOTP: "",
        invalidMobileNumber: ""
    });

    const setMobileNumber = (event) => {
        setState((prevState)=>{
            return {
            ...prevState,
            phoneNumber: event.target.value
         };
        })
    };
    const setOTP = (event) => {
        setState(prevState => {
            return {
                ...prevState,
                otp: event.target.value
            }
        });
    };
    const getOTPHandler = () => {
        if (state.phoneNumber.length < 10 || isNaN(state.phoneNumber)) {
            setState((prevState) => {
                return {
                    ...prevState,
                    invalidMobileNumber: "* Invalid mobile number"
                }
            })
        } else {
            const url = '/divoc/api/citizen/generateOTP'
            axios.post(url, {phone: state.phoneNumber})
                .then((response) => {
                    setState((prevState) => {
                        return {
                            ...prevState,
                            showOnlyOTP: !prevState.showOnlyOTP,
                            invalidOTP: "",
                            invalidMobileNumber: ""
                        }
                    })
                }).catch((error) => {
                console.log(error)
                alert(error)
            })
        }
    };
    const verifyHandler = () => {
        const url = '/divoc/api/citizen/verifyOTP'
        axios.post(url, {phone: state.phoneNumber, otp: state.otp})
            .then((response) => {
                setCookie(CITIZEN_TOKEN_COOKIE_NAME, "Bearer " +  response.data.token, 1)
                window.location.href = "/registration";
            }).catch((error) => {
            setState((prevState) => {
                return {
                    ...prevState,
                    invalidOTP: "* Invalid OTP"
                }
            })
        })

    };
    const backBtnHandler = () => {
        setState((prevState) => {
            return {
                ...prevState,
                otp: "",
                invalidOTP: "",
                showOnlyOTP: !prevState.showOnlyOTP
            }
        })
    };
    {
        const infoText = <>
            <h2>
                Registration and Appointment Portal
            </h2>
            <h4>
                Get Started by entering your mobile number
            </h4>
        </>
        const inputs = <>
            <form>
                <div className="form-row">
                    <div className="form-group col-md-3">
                        <input placeholder="Mobile number"
                               ref={ref => ref && ref.focus()}
                               className="form-control form-control-lg"
                               onChange={setMobileNumber}
                               value={state.phoneNumber}
                               disabled={!state.showOnlyOTP}
                               maxLength={10}
                        />
                        <div className="invalid-input">
                            {state.invalidMobileNumber}
                        </div>
                    </div>
                    <div className="form-group col-md-3" >
                        <input placeholder="OTP" maxLength={4}
                               ref={ref => ref && ref.focus()}
                               className="login-otp form-control form-control-lg"
                               onChange={setOTP}
                               value={state.otp}
                               disabled={state.showOnlyOTP}
                        />
                        <div className="invalid-input">
                            {state.invalidOTP}
                        </div>
                    </div>
                </div>
            </form>
        </>

        const getOTPButton = <button disabled={state.phoneNumber.length === 0} className={"custom-button purple-btn"} onClick={getOTPHandler}>Get OTP</button>;
        const verifyButton = <button disabled={state.otp.length === 0} className={"custom-button purple-btn"} onClick={verifyHandler}>Verify</button>;
        const backButton = <button className="btn btn-link transparent-button" onClick={backBtnHandler}>Back</button>;

        return <div className="citizen-login">
            {infoText}
            {inputs}
            <br/>
            {state.showOnlyOTP && getOTPButton}
            <div>
                {!state.showOnlyOTP && backButton}
                {!state.showOnlyOTP && verifyButton}
            </div>
        </div>
    }
}
