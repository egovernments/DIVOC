import React, { useEffect, useState } from "react";
import styles from "./MapView.module.css";
import LeafletMap from "../IndiaMap/LeafletMap";
import DataTable from "../DataTable/DataTable";
import axios from "axios";

function Home() {
    const [districtList, setDistrictList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [selectedState, setSelectedState] = useState({ name: "", count: 0 });
    const [selectedDistrict, setSelectedDistrict] = useState([
        { name: "", count: 0 },
    ]);
    const [stateWiseCertificateData,setStateWiseCertificateData] = useState({})
    const [districtWiseCertificateData,setDistrictWiseCertificateData] = useState({})

    useEffect(() => {
        fetchStatewiseCertificateData()
    }, []);

    function fetchStatewiseCertificateData() {
        axios.get('/divoc/admin/api/v1/public')
            .then(res => {
                setStateWiseCertificateData(res.data.numberOfCertificatesIssuedByState)
                setDistrictWiseCertificateData(res.data.numberOfCertificatesIssuedByDistrict)
            });
    }

    
    return (
        <div className={styles["container"]}>
            <div className={styles["map-container"]}>
                {Object.keys(stateWiseCertificateData).length > 0 && <LeafletMap
                    setSelectedState={setSelectedState}
                    selectedState={selectedState}
                    selectedDistrict={selectedDistrict}
                    setSelectedDistrict={setSelectedDistrict}
                    districtList={districtList}
                    setDistrictList={setDistrictList}
                    stateList={stateList}
                    setStateList={setStateList}
                    stateWiseCertificateData={stateWiseCertificateData}
                />}
            </div>
            <div className={styles["table-container"] + " float-right"}>
                <DataTable
                    setSelectedData={setSelectedState}
                    selectedData={selectedState}
                    rowTitle={stateList}
                    title="ALL OF INDIA"
                    rowData={stateWiseCertificateData}
                />
            </div>
            {selectedState.name !== "" && <div className={styles["table-container"]}>
               <DataTable
                    setSelectedData={setSelectedDistrict}
                    selectedData={selectedDistrict}
                    rowTitle={districtList}
                    title={selectedState.name}
                    rowData={districtWiseCertificateData}
               />
            </div>}

        </div>
    );
}

export default Home;
