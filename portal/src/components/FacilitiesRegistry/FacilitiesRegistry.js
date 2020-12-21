import React, {useEffect, useState} from 'react';
import UploadCSV from '../UploadCSV/UploadCSV';
import {useAxios} from "../../utils/useAxios";
import {TotalRecords} from "../TotalRecords";
import {SampleCSV} from "../../utils/constants";
import {UploadHistoryTable} from "../UploadHistoryTable";

function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const fileUploadAPI = 'divoc/admin/api/v1/facilities';
    const axiosInstance = useAxios('');

    useEffect(() => {
        fetchFacilities()
    }, []);

    function fetchFacilities() {
        axiosInstance.current.get(fileUploadAPI)
            .then(res => {
                setFacilities(res.data)
            });
    }

    return (
        <div>
            <div className="d-flex mt-3">
                <UploadCSV fileUploadAPI={fileUploadAPI} onUploadComplete={fetchFacilities}
                           sampleCSV={SampleCSV.FACILITY_REGISTRY}/>
                <TotalRecords
                    title={"Total # of Records in the\n DIVOC Facility Registry"}
                    count={facilities.length}
                />
            </div>
            <UploadHistoryTable data={historyData} headerData={headerData}/>
        </div>
    );
}

const headerData = [
    {
        title: "FILE NAME",
        key: "fileName"
    },
    {
        title: "DATE",
        key: "date"
    },
    {
        title: "TIME",
        key: "time"
    },
    {
        title: "RECORDS",
        key: "records"
    },
    {
        title: "ERRORS",
        key: "errors"
    }
]

const historyData = [
    {
        fileName: "File 1",
        date: "12-12-2020",
        time: "11:00 AM",
        records: "208",
        errors: "8"
    },
    {
        fileName: "File 2",
        date: "12-12-2021",
        time: "11:00 AM",
        records: "28",
        errors: "81"
    },
    {
        fileName: "File 3",
        date: "12-12-2022",
        time: "11:02 AM",
        records: "222",
        errors: "82"
    }

]

export default Facilities;
