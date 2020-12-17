import React from "react";
import {Accordion, Card, Row} from "react-bootstrap";
import {AnalyticsCard} from "../AnalyticsCard";
import GovernmentFacilitiesImg from "../../assets/img/government-facilities.svg";
import FemaleImg from "../../assets/img/female-icon.svg";
import MaleImg from "../../assets/img/male-icon.svg";
import {ColumnChart} from "../ColumnChart";
import {AreaChart} from "../AreaChart";
import {pathOr} from "ramda";
import {XYPlot} from "react-vis";

export const CertificateAnalysis = ({analytics}) => {
    const certificatesByAge = pathOr({}, ["numberOfCertificatesIssuedByAge"], analytics);
    const certificatesByDate = pathOr({}, ["numberOfCertificatesIssuedByDate"], analytics);
    const certificatesByState = pathOr({}, ["numberOfCertificatesIssuedByState"], analytics);
    const ageWiseChartData = Object.keys(certificatesByAge).map((key) => ({x: key, y: certificatesByAge[key]}));
    let dateWiseChartData = Object.keys(certificatesByDate).map((key) => ({x: key, y: certificatesByDate[key]}));
    dateWiseChartData = [...dateWiseChartData, {x: dateWiseChartData[dateWiseChartData.length - 1].x + 1, y: 0}];
    let stateWiseChartData = Object.keys(certificatesByState).map((key) => ({x: key || "All", y: certificatesByState[key]}));
    return (

        <Card>
            <Accordion.Toggle as={Card.Header} eventKey="0">
                Certificate Issuing Details
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <Card.Body>
                    <Row>
                        <AnalyticsCard lgCols={4} title={"Total Certificates Issued"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex justify-content-center align-items-center">
                                                   <img src={GovernmentFacilitiesImg} alt={""} width={"20%"}/>
                                                   <div className="ml-3 d-flex flex-column">
                                                       <span>In Facilities</span>
                                                       <span style={{
                                                           fontSize: "20px",
                                                           fontWeight: "bold"
                                                       }}>{pathOr("", ["numberOfCertificatesIssued", "all"], analytics)}</span>
                                                   </div>
                                               </div>
                                               {/*<div
                                                   className="ml-3 p-1 d-flex justify-content-center align-items-center">
                                                   <img src={PrivateFacilitiesImg} alt={""} width={"20%"}/>
                                                   <div className="ml-3 d-flex flex-column">
                                                       <span>In Private Facilities</span>
                                                       <span style={{
                                                           fontSize: "20px",
                                                           fontWeight: "bold"
                                                       }}>12,000,000</span>
                                                   </div>
                                               </div>*/}
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={3} title={"By Gender"}
                                       subtitle={<span className="metric-value">{pathOr("", ["numberOfCertificatesIssued", "all"], analytics)}</span>}
                                       body={
                                           <div className="d-flex justify-content-center">
                                               <div className="d-flex align-items-center justify-content-center">
                                                   <div className="d-flex flex-column pl-2 pr-2">
                                                       <span
                                                           className="font-weight-bold">{pathOr("", ["numberOfCertificatesIssued", "Male"], analytics)}</span>
                                                       <span>Male</span>
                                                   </div>
                                                   <img src={MaleImg} alt={""} height={"75%"}/>
                                               </div>
                                               <div
                                                   className="d-flex align-items-center justify-content-center flex-row-reverse">
                                                   <div className="d-flex flex-column pl-2 pr-2">
                                                       <span
                                                           className="font-weight-bold">{pathOr("", ["numberOfCertificatesIssued", "Female"], analytics)}</span>
                                                       <span>Female</span>
                                                   </div>
                                                   <img src={FemaleImg} alt={""} height={"75%"}/>
                                               </div>
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={5} title={"By Age Groups"}
                                       subtitle={<span/>}
                                       body={
                                           <ColumnChart
                                               data={ageWiseChartData}
                                               width={500} height={150}
                                               color={"#DE9D00"}
                                           />
                                       }
                        />
                    </Row>
                    <Row>
                        <AnalyticsCard lgCols={6} title={"By Date"}
                                       className="mt-3"
                                       subtitle={<span/>}
                                       body={
                                           <div className="d-flex justify-content-center">
                                               <AreaChart
                                                   data={dateWiseChartData}
                                                   width={600} height={300}
                                               />
                                           </div>
                                       }
                        />
                        <AnalyticsCard lgCols={6} title={"By State"}
                                       className="mt-3"
                                       subtitle={<span/>}
                                       body={
                                           <div className="d-flex justify-content-center">
                                               <ColumnChart
                                                   data={stateWiseChartData}
                                                   width={600} height={300}
                                                   color={"#8DA2FF"}
                                               />
                                           </div>
                                       }
                        />
                    </Row>
                </Card.Body>
            </Accordion.Collapse>
        </Card>

    )
};

