import React from "react";
import {Accordion, Card, Row} from "react-bootstrap";
import {AnalyticsCard} from "../AnalyticsCard";
import {ColumnChart} from "../ColumnChart";
import {AreaChart} from "../AreaChart";
import {pathOr} from "ramda";
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const CertificateQueryAnalysis = ({analytics}) => {
    return (

        <Card>
            <Accordion.Toggle as={Card.Header} eventKey="2">
                Certificate Issuing Details
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="2">
                <Card.Body>
                    <Row>
                        <AnalyticsCard lgCols={3} title={"Total # of Certificates Downloaded"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr(0, ["certificatedDownloaded", "all"], analytics)}</span>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={3} title={"# of Authentication Queries"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr(0, ["authenticQuery", "all"], analytics)}</span>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={3} title={"# of Fake Certificate Queries"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr(0, ["fakeQuery", "all"], analytics)}</span>
                                               </div>
                                           </div>
                                       }
                        />
                    </Row>
                </Card.Body>
            </Accordion.Collapse>
        </Card>

    )
};

