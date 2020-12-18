import React from "react";
import {Accordion, Card, Row} from "react-bootstrap";
import {AnalyticsCard} from "../AnalyticsCard";
import {ColumnChart} from "../ColumnChart";
import {AreaChart} from "../AreaChart";
import {pathOr} from "ramda";
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const CertificateQueryAnalysis = ({analytics}) => {
  const downloadByDate = pathOr({}, ["downloadByDate"], analytics);
    let dateWiseChartData = Object.keys(downloadByDate)
    .map((key) => ({
      x: (key.substr(6, 2)+ "-" + MONTH_NAMES[key.substr(4, 2) - 1] + "-" + key.substr(0, 4) ),
      y: downloadByDate[key]
    }));

    const verifyByDate = pathOr({}, ["verifyByDate"], analytics);
    let dateWiseVerificationChartData = Object.keys(downloadByDate)
    .map((key) => ({
      x: (key.substr(6, 2)+ "-" + MONTH_NAMES[key.substr(4, 2) - 1] + "-" + key.substr(0, 4) ),
      y: downloadByDate[key]
    }));
    return (

        <Card>
            <Accordion.Toggle as={Card.Header} eventKey="2">
                Certificate Download Details
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="2">
                <Card.Body>
                    <Row>

                      <AnalyticsCard lgCols={6} title={"Download By Date"}
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
                      <AnalyticsCard lgCols={6} title={"Verification By Date"}
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
                    </Row>
                </Card.Body>
            </Accordion.Collapse>
        </Card>

    )
};

