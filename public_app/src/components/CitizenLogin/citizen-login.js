import {useEffect, useState} from "react";
import './citized-login.css'
import axios from "axios";
import {setCookie} from "../../utils/cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../../constants";

export function CitizenLoginComponent(props) {
    const [state, setState] = useState({
        phoneNumber: (props.location.state && props.location.state.mobileNumber) ? props.location.state.mobileNumber : "",
        otp: "",
        showOnlyOTP: true,
        invalidOTP: "",
        invalidMobileNumber: ""
    });

    useEffect(() => {
        if (props.location.state && props.location.state.mobileNumber) {
            getOTPHandler()
        }
    }, [])

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
            <label style={{fontWeight: 500, fontSize: "40px"}} className="mb-5">
                Registration and Appointment Portal
            </label>
            <h5 style={{fontWeight: 600}} className="mb-5">
                Get started by entering your mobile number
            </h5>
        </>
        const inputs = <>
            <form>
                <div className="form-row">
                    <div className="form-group col-sm-3">
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
                    <div className="form-group col-sm-3 login-otp" >
                        <label htmlFor="otp"  hidden={state.showOnlyOTP} >OTP</label>
                        <input id="otp" maxLength={6}
                               ref={ref => ref && ref.focus()}
                               className="form-control form-control-lg"
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

        const getOTPButton = <button disabled={state.phoneNumber.length === 0}
                                     className={"custom-button purple-btn"}
                                     onClick={getOTPHandler}><span>Get OTP &#8594;</span></button>;
        const verifyButton = <button disabled={state.otp.length === 0}
                                     className={"custom-button purple-btn"}
                                     onClick={verifyHandler}><span>Verify &#8594;</span></button>;
        const backButton = <button style={{paddingLeft: "0px"}} className="btn btn-link transparent-button"
                                   onClick={backBtnHandler}>Back</button>;

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
