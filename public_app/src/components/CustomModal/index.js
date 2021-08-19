import React from "react";
import {Modal} from "react-bootstrap";
import "./index.css";
import {CustomButton} from "../CustomButton";
import {useTranslation} from "react-i18next";

export const CustomModal = ({showModal, onClose, title, onPrimaryBtnClick, children, primaryBtnText = "Continue"}) => {
    const {t} = useTranslation();

    primaryBtnText = primaryBtnText ? primaryBtnText : t("button.continue");
    const cancelBtnText = t("button.cancel")
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
                    <span>{cancelBtnText}</span>
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