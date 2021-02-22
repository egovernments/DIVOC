import React from "react";
import "./index.scss"
import * as PropTypes from "prop-types";

export const InfoCard = (props) => (
    <div className="d-flex info-card-wrapper m-1">
        <span className="info-metric">{props.metric}</span>
        <span className="info-title pl-2">{props.title}</span>
    </div>
);

InfoCard.propTypes = {
    metric: PropTypes.number.isRequired,
};

