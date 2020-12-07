import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {CustomTable} from "../CustomTable";

function PreEnrollment(){
    const [enrollments, setEnrollments] = useState([]);
    const fileUploadAPI = 'divoc/admin/api/v1/enrollments';
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
    return(
        <div>
            <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchEnrollment}/>
            <CustomTable data={enrollments} fields={["name", "phone", "enrollmentScopeId"]}/>
        </div>
    );
}
export default PreEnrollment;