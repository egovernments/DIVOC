import React, {useEffect, useState} from "react";
import {CertificateAnalysis} from "../CertificateAnalysis";
import {Accordion} from "react-bootstrap";
import {useAxios} from "../../utils/useAxios";
import {FacilityAnalysis} from "../FacilityAnalysis";
import {CertificateQueryAnalysis} from "../CertificateQueryAnalysis";


export function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const getAnalyticsPath = '/divoc/admin/api/v1/analytics';
    const axiosInstance = useAxios('');
    useEffect(() => {
        axiosInstance.current.get(getAnalyticsPath)
            .then(res => {
                setAnalytics(res.data)
            });
    }, []);
    return (
        <div className="container-fluid mt-5 pb-5">
            <Accordion defaultActiveKey="0">
                {analytics && <CertificateAnalysis analytics={analytics}/>}
            </Accordion>
            <Accordion>
                {analytics && <CertificateQueryAnalysis analytics={analytics}/>}
            </Accordion>
            <Accordion>
                {analytics && <FacilityAnalysis analytics={analytics}/>}
            </Accordion>
        </div>
    )
}
