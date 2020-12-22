import React from "react";
import {Accordion, Card, Row} from "react-bootstrap";
import {AnalyticsCard} from "../AnalyticsCard";
import {pathOr} from "ramda";

export const FacilityAnalysis = ({analytics}) => {
    return (
        <Card>
            <Accordion.Toggle as={Card.Header} eventKey="1">
                Facility Details
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="1">
                <Card.Body>
                    <Row>
                        <AnalyticsCard lgCols={3} title={"Total Issuing Facilities"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr(0, ["facilitiesCount", "value"], analytics)}</span>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={3} title={"Total Number of Vaccinators"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr(0, ["vaccinatorsCount", "value"], analytics)}</span>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={3} title={"Average Rate across facilities"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr(0, ["avgRateAcrossFacilities", "value"], analytics)}</span>
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

