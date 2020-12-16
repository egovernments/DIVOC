import React from "react";
import {CertificateAnalysis} from "../CertificateAnalysis";
import {Accordion} from "react-bootstrap";


export function Analytics() {
    return (
        <div className="container-fluid mt-5">
            <Accordion defaultActiveKey="0">
                <CertificateAnalysis/>
            </Accordion>
        </div>
    )
}
