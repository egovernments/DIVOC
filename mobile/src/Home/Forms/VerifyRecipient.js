import {FormCard} from "../../Base/Base";
import React from "react";
import {useHome} from "../Home";
import Button from "react-bootstrap/Button";

export function VerifyRecipient(props) {
    const {goNext, goBack} = useHome()
    return (
        <FormCard onBack={() => {
            goBack()
        }} content={<Button onClick={() => {
            goNext('/preEnroll/')
        }}>Content Goes here</Button>} title={"Verify Recipient"}/>
    );
}
