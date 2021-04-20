import React, {useState} from "react";
import axios from "axios";
import {Button, Modal, OverlayTrigger, Tooltip} from "react-bootstrap";
import {CustomButton} from "../CustomButton";
import {CITIZEN_TOKEN_COOKIE_NAME} from "../../constants";
import {getCookie} from "../../utils/cookies";
import {useHistory} from "react-router-dom";
import {FormPersonalDetails} from "../Registration/AddMember/FormPersonalDetails";
import {pathOr} from "ramda";
import {Loader} from "../Loader";
import "./index.css"
import {CustomModal} from "../CustomModal";

export const ViewRecipient = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const {state} = props.location;
    const formData = {
        identity: state.member.identity,
        name: state.member.name,
        yob: state.member.yob,
        gender: state.member.gender,
        state: state.member.address.state,
        district: state.member.address.district,
        locality: state.member.address.addressLine2 || "",
        pincode: state.member.address.pincode,
        email: state.member.email || "",
        contact: state.member.phone
    };
    const [showModal, setShowModal] = useState(false);
    const header = <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Beneficiary Details</h3>
        <CustomButton isLink={true} type="submit" onClick={() => {
            history.push("/registration")
        }}>
            <span>Back</span>
        </CustomButton>
    </div>;

    const appointments = state.member.appointments.filter(appointment => appointment.enrollmentScopeId !== "");
    const footer = <div>
        <CustomButton disabled={appointments.length !== 0}
                      className={`${appointments.length === 0 ? "blue-outline-btn" : "disabled-outline-btn"}`}
                      onClick={() => {
                          setShowModal(true)
                      }}>
            <span>Delete</span>
        </CustomButton>
        <OverlayTrigger
            trigger="click"
            key={"right"}
            placement={"right"}
            delay={{ hide: 4000 }}
            overlay={
                <Tooltip id={`tooltip-right`}>
                    A member can deleted only if the member is not registered to any program
                </Tooltip>
            }
        >
            <span className="delete-tooltip">?</span>
        </OverlayTrigger>
    </div>;
    return (
        <div className="view-details-wrapper">
            {isLoading ? <Loader/> :
                <><FormPersonalDetails
                    formData={formData}
                    header={header}
                    footer={footer}
                    verifyDetails={true}
                    navigation={{
                        previous: () => {
                        },
                        next: () => {
                        }
                    }}/>
                    <DeleteRecipientModal member={state.member} showModal={showModal} onHideModal={() => {
                        setShowModal(false)
                    }} setIsLoading={setIsLoading}/></>}
        </div>
    )
};

const DeleteRecipientModal = ({showModal, onHideModal, member, setIsLoading}) => {
    const history = useHistory();

    function callDeleteRecipient() {
        setIsLoading(true);
        const token = getCookie(CITIZEN_TOKEN_COOKIE_NAME);
        const config = {
            headers: {"Authorization": token, "Content-Type": "application/json"},
            data: {
                enrollmentCode: member.code
            }
        };

        axios.delete("/divoc/api/citizen/recipients", config)
            .then(res => {
                setTimeout(() => {
                    history.push("/registration")
                }, 3000);

            })
            .catch((err) => {
                if (pathOr("", ["response", "data", "message"], err) !== "") {
                    alert(err.response.data.message);
                } else {
                    alert("Something went wrong. Please try again");
                }
            })
            .finally(() => {
                onHideModal(false);
            });
    }

    return (
        <>
            <CustomModal title={"Delete Member"} onClose={onHideModal} onPrimaryBtnClick={callDeleteRecipient}
                         showModal={showModal} primaryBtnText={"Yes, Delete"}>
                <div className="d-flex justify-content-between align-items-center">
                    {`${member.name} member and all associated information will be deleted`}
                </div>

            </CustomModal>
            <Modal size={"md"} show={false} onHide={onHideModal} centered backdrop="static" keyboard={false}
                   className="select-program-modal p-3">

                <div className="d-flex flex-column justify-content-center align-items-center pb-3">
                    <CustomButton className="blue-btn" onClick={callDeleteRecipient}>CONFIRM</CustomButton>
                </div>
            </Modal>
        </>
)
}