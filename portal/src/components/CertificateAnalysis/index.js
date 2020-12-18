import React from "react";
import {Accordion, Card, Row} from "react-bootstrap";
import { useRouteMatch,useHistory } from 'react-router-dom';
import {AnalyticsCard} from "../AnalyticsCard";
import {ColumnChart} from "../ColumnChart";
import {AreaChart} from "../AreaChart";
import {pathOr} from "ramda";
import MapView from "../MapView/MapView";
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const CertificateAnalysis = ({analytics}) => {
    const certificatesByAge = pathOr({}, ["numberOfCertificatesIssuedByAge"], analytics);
    const certificatesByDate = pathOr({}, ["numberOfCertificatesIssuedByDate"], analytics);
    const certificatesByState = pathOr({}, ["numberOfCertificatesIssuedByState"], analytics);
    const ageWiseChartData = Object.keys(certificatesByAge).map((key, index, elements) => {
        if (index === elements.length - 1) {
            return {x: `${key} - ${parseInt(key) + 10}`, y: certificatesByAge[key]}
        } else {
            return {x: `${key} - ${elements[index + 1]}`, y: certificatesByAge[key]}
        }
    });
    let dateWiseChartData = Object.keys(certificatesByDate).map((key) => ({x: key, y: certificatesByDate[key]}));
    dateWiseChartData = [...dateWiseChartData, {x: ""+(parseInt(dateWiseChartData[dateWiseChartData.length - 1].x) + 1), y: 0}];
    dateWiseChartData = dateWiseChartData.map(({x,y}) => {
        return {x: (x.substr(0,4) + "-" + MONTH_NAMES[x.substr(4,2)-1] + "-" + x.substr(6,2)), y}
    });
    let stateWiseChartData = Object.keys(certificatesByState).map((key) => ({
        x: key || "All",
        y: certificatesByState[key]
    }));

    const { path } = useRouteMatch();
    const history = useHistory();

    const handleClick = () => {
        history.push({
          pathname: `${path}/map`,
        });
      };

    return (

        <Card>
            <Accordion.Toggle as={Card.Header} eventKey="0">
                Certificate Issuing Details
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <Card.Body>
                    <Row>
                        <AnalyticsCard lgCols={2} title={"Total Certificates Issued"}
                                       subtitle={<span className="metric-value">{}</span>}
                                       body={
                                           <div className="p-3 d-flex justify-content-center">
                                               <div
                                                   className="mr-3 p-1 d-flex">
                                                   <span className="metric-value" style={{
                                                       fontSize: "5rem",
                                                       fontWeight: "bold"
                                                   }}>{pathOr("", ["numberOfCertificatesIssued", "all"], analytics)}</span>
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
                        <AnalyticsCard lgCols={5} title={"By Gender"}
                                       subtitle={<span
                                           className="metric-value">{pathOr("", ["numberOfCertificatesIssued", "all"], analytics)}</span>}
                                       body={
                                           <ColumnChart
                                               data={[
                                                   {
                                                       x: "Male",
                                                       y: pathOr(0, ["numberOfCertificatesIssued", "Male"], analytics)
                                                   },
                                                   {
                                                       x: "Female",
                                                       y: pathOr(0, ["numberOfCertificatesIssued", "Female"], analytics)
                                                   },
                                                   {
                                                       x: "Others",
                                                       y: pathOr(0, ["numberOfCertificatesIssued", ""], analytics) + pathOr(0, ["numberOfCertificatesIssued", "Others"], analytics)
                                                   }
                                               ]}
                                               width={500} height={150}
                                               color={"rgba(141,162,255,0.5)"}
                                           />
                                           /*<div className="d-flex justify-content-center">
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
                                           </div>*/
                                       }
                        />
                        <AnalyticsCard lgCols={5} title={"By Age Groups"}
                                       subtitle={<span/>}
                                       body={
                                           <ColumnChart
                                               data={ageWiseChartData}
                                               width={500} height={150}
                                               color={"rgba(44,216,137,0.5)"}
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
                                       subtitle={<button onClick={() => handleClick()}>Map View</button>}
                                       body={
                                           <div className="d-flex justify-content-center">
                                               <ColumnChart
                                                   data={stateWiseChartData}
                                                   width={600} height={300}
                                                   color={"rgba(222,157,0,0.5)"}
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

