import React, {useEffect, useState} from "react";
import {CertificateAnalysis} from "../CertificateAnalysis";
import {Accordion} from "react-bootstrap";
import {useAxios} from "../../utils/useAxios";


export function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const getAnalyticsPath = 'divoc/admin/api/v1/analytics';
    const axiosInstance = useAxios('');
    useEffect(() => {
        axiosInstance.current.get(getAnalyticsPath)
            .then(res => {
                setAnalytics(res.data)
            });
    });
    return (
        <div className="container-fluid mt-5">
            <Accordion defaultActiveKey="0">
                {analytics && <CertificateAnalysis analytics={analytics}/>}
            </Accordion>
        </div>
    )
}
