import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {CustomTable} from "../CustomTable";
import {TotalRecords} from "../TotalRecords";
import {SampleCSV} from "../../utils/constants";

function PreEnrollment() {
    const [enrollments, setEnrollments] = useState([]);
    const fileUploadAPI = '/divoc/admin/api/v1/enrollments';
    const axiosInstance = useAxios('');
    useEffect(() => {
        fetchEnrollment()
    }, []);

    function fetchEnrollment() {
        axiosInstance.current.get(fileUploadAPI)
            .then(res => {
                setEnrollments(res.data)
            });
    }

    return (
        <div>
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchEnrollment}
                           sampleCSV={SampleCSV.PRE_ENROLLMENT}
                />
                <TotalRecords
                    title={"Total # of Enrollments in the\nDIVOC Enrollments Registry"}
                    count={enrollments.length}
                />
            </div>
            <CustomTable data={enrollments} fields={["name", "phone", "enrollmentScopeId"]}/>
        </div>
    );
}

export default PreEnrollment;
