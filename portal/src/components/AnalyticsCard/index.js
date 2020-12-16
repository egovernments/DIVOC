import React from "react";
import {Col} from "react-bootstrap";
import "./index.css";

export const AnalyticsCard = ({title, subtitle, lgCols, body, className}) => (
    <Col lg={lgCols} className={className}>
        <div className="w-100 h-100 analytics-card-wrapper">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                <span>{title}</span>
                {subtitle}
            </div>
            <div className="">
                {body}
            </div>
        </div>
    </Col>
);