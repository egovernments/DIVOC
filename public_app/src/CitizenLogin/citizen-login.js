import {Component, useState} from "react";
import './citized-login.css'
import axios from "axios";
import {setCookie} from "../utils/cookies";
import {useHistory} from "react-router";

export function CitizenLoginComponent() {
    const [state, setState] = useState({
        phoneNumber: "",
        otp: "",
        showOnlyOTP: true
    });

    const history = useHistory();

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
        const url = '/divoc/api/citizen/generateOTP'
        axios.post(url, {phone: state.phoneNumber})
            .then((response) => {
                setState((prevState) => {
                    return {
                        ...prevState,
                        showOnlyOTP: !prevState.showOnlyOTP
                    }
                })
            }).catch((error) => {
                console.log(error)
                alert(error)
        })
    };
    const verifyHandler = () => {
        const url = '/divoc/api/citizen/verifyOTP'
        axios.post(url, {phone: state.phoneNumber, otp: state.otp})
            .then((response) => {
                setCookie(CITIZEN_TOKEN_COOKIE_NAME, response.data.token, 1)
                // redirect to add member
                history.push("/registration")

            }).catch((error) => {
            console.log(error)
            alert(error)
        })

    };
    const backBtnHandler = () => {
        setState((prevState) => {
            return {
                ...prevState,
                otp: "",
                showOnlyOTP: !prevState.showOnlyOTP
            }
        })
    };
    {
        const infoText = <>
            <h2>
                Registration & Appointment Portal
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
                               className="form-control form-control-lg"
                               onChange={setMobileNumber}
                               value={state.phoneNumber}
                               disabled={!state.showOnlyOTP}
                        />
                    </div>
                    <div className="form-group col-md-3">
                        <input placeholder="OTP"
                               className="form-control form-control-lg"
                               onChange={setOTP}
                               value={state.otp}
                               disabled={state.showOnlyOTP}
                        />
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
