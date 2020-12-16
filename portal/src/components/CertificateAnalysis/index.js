import React from "react";
import {Accordion, Card, Row} from "react-bootstrap";
import {AnalyticsCard} from "../AnalyticsCard";
import PrivateFacilitiesImg from "../../assets/img/private-facilities.svg";
import GovernmentFacilitiesImg from "../../assets/img/government-facilities.svg";
import FemaleImg from "../../assets/img/female-icon.svg";
import MaleImg from "../../assets/img/male-icon.svg";
import {ColumnChart} from "../ColumnChart";
import {AreaChart} from "../AreaChart";
export const CertificateAnalysis = () => {
    return (

        <Card>
            <Accordion.Toggle as={Card.Header} eventKey="0">
                Certificate Issuing Details
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <Card.Body>
                    <Row>
                        <AnalyticsCard lgCols={4} title={"Total Certificates Issued"}
                                       subtitle={<span className="metric-value">21,000,000</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div className="mr-3 p-1 d-flex justify-content-center align-items-center">
                                                   <img src={GovernmentFacilitiesImg} alt={""} width={"20%"}/>
                                                   <div className="ml-3 d-flex flex-column">
                                                       <span>In Government Facilities</span>
                                                       <span style={{fontSize: "20px", fontWeight: "bold"}}>12,000,000</span>
                                                   </div>
                                               </div>
                                               <div className="ml-3 p-1 d-flex justify-content-center align-items-center">
                                                   <img src={PrivateFacilitiesImg} alt={""} width={"20%"}/>
                                                   <div className="ml-3 d-flex flex-column">
                                                       <span>In Private Facilities</span>
                                                       <span style={{fontSize: "20px", fontWeight: "bold"}}>12,000,000</span>
                                                   </div>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={3} title={"By Gender"}
                                       subtitle={<span/>}
                                       body={
                                           <div className="d-flex justify-content-center">
                                               <div className="d-flex align-items-center justify-content-center">
                                                   <div className="d-flex flex-column pl-2 pr-2">
                                                       <span className="font-weight-bold">45%</span>
                                                       <span>Male</span>
                                                   </div>
                                                   <img src={MaleImg} alt={""} height={"75%"}/>
                                               </div>
                                               <div className="d-flex align-items-center justify-content-center flex-row-reverse">
                                                   <div className="d-flex flex-column pl-2 pr-2">
                                                       <span className="font-weight-bold">45%</span>
                                                       <span>Female</span>
                                                   </div>
                                                   <img src={FemaleImg} alt={""} height={"75%"}/>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={5} title={"By Age Groups"}
                                       subtitle={<span/>}
                                       body={<ColumnChart/>}
                        />
                    </Row>
                    <Row>
                        <AnalyticsCard lgCols={12} title={"By Age Groups"}
                                       className="mt-3"
                                       subtitle={<span/>}
                                       body={
                                           <div className="d-flex justify-content-center">
                                               <AreaChart/>
                                           </div>
                                       }
                        />
                    </Row>
                </Card.Body>
            </Accordion.Collapse>
        </Card>

    )
};

