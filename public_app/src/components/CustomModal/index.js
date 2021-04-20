import React from "react";
import {Modal} from "react-bootstrap";
import "./index.css";
import {CustomButton} from "../CustomButton";

export const CustomModal = ({showModal, onClose, title, onPrimaryBtnClick, children, primaryBtnText = "Continue"}) => {
    return (
        <Modal show={showModal} centered backdrop="static" keyboard={false} className="custom-modal-wrapper">
            <span className="custom-modal-title font-weight-bolder">{title}</span>
            <div>
              {
                children
              }
            </div>
            <div className="d-flex justify-content-between pt-3 flex-lg-row flex-column-reverse">
                <CustomButton className={"blue-outline-btn"} onClick={() => {
                    onClose(true)
                }}>
                    <span>Cancel</span>
                </CustomButton>
                <CustomButton className="blue-primary-btn" onClick={() => {
                  onPrimaryBtnClick(true)
                }}>
                    <span>{primaryBtnText}</span>
                </CustomButton>
            </div>
        </Modal>
    );
};