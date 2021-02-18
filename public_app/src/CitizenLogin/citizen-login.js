import {Component} from "react";
import './citized-login.css'
import axios from "axios";
import {setCookie} from "../utils/cookies";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../constants";

export class CitizenLoginComponent extends Component{
    state = {
        phoneNumber: "",
        otp: "",
        showOnlyOTP: true
    }

    setMobileNumber = (event) => {
        this.setState({
            phoneNumber: event.target.value
        })
    }
    setOTP = (event) => {
        this.setState({
            otp: event.target.value
        })
    }
    getOTPHandler = () => {
        const url = '/divoc/api/citizen/generateOTP'
        axios.post(url, {phone: this.state.phoneNumber})
            .then((response) => {
                this.setState((prevState) => {
                    return {
                        showOnlyOTP: !prevState.showOnlyOTP
                    }
                })
            }).catch((error) => {
                console.log(error)
                alert(error)
        })
    };
    verifyHandler = () => {
        const url = '/divoc/api/citizen/verifyOTP'
        axios.post(url, {phone: this.state.phoneNumber, otp: this.state.otp})
            .then((response) => {
                setCookie(CITIZEN_TOKEN_COOKIE_NAME, response.data.token, 1)
                // redirect to add member
                this.setState((prevState) => {
                    return {
                        showOnlyOTP: !prevState.showOnlyOTP
                    }
                })
            }).catch((error) => {
            console.log(error)
            alert(error)
        })

    };
    backBtnHandler = () => {
        this.setState((prevState) => {
            return {
                otp: "",
                showOnlyOTP: !prevState.showOnlyOTP
            }
        })
    };
    render() {
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
                               onChange={this.setMobileNumber}
                               value={this.state.phoneNumber}
                               disabled={!this.state.showOnlyOTP}
                        />
                    </div>
                    <div className="form-group col-md-3">
                        <input placeholder="OTP"
                               className="form-control form-control-lg"
                               onChange={this.setOTP}
                               value={this.state.otp}
                               disabled={this.state.showOnlyOTP}
                        />
                    </div>
                </div>
            </form>
        </>

        const getOTPButton = <button disabled={this.state.phoneNumber.length === 0} className={"custom-button purple-btn"} onClick={this.getOTPHandler}>Get OTP</button>;
        const verifyButton = <button disabled={this.state.otp.length === 0} className={"custom-button purple-btn"} onClick={this.verifyHandler}>Verify</button>;
        const backButton = <button className="btn btn-link transparent-button" onClick={this.backBtnHandler}>Back</button>;

        return <div className="citizen-login">
            {infoText}
            {inputs}
            <br/>
            {this.state.showOnlyOTP && getOTPButton}
            <div>
                {!this.state.showOnlyOTP && backButton}
                {!this.state.showOnlyOTP && verifyButton}
            </div>
        </div>
    }
}
