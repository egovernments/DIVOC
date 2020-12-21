import React, { useEffect, useState } from "react";
import styles from "./MapView.module.css";
import LeafletMap from "../IndiaMap/LeafletMap";
import DataTable from "../DataTable/DataTable";
import {useAxios} from "../../utils/useAxios";

function Home() {
    const [districtList, setDistrictList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [selectedState, setSelectedState] = useState({ name: "", count: 0 });
    const [selectedDistrict, setSelectedDistrict] = useState([
        { name: "", count: 0 },
    ]);
    const [stateWiseCertificateData,setStateWiseCertificateData] = useState([])
    const certificateAPI = '/divoc/admin/api/v1/analytics';
    const axiosInstance = useAxios('');

    useEffect(() => {
        fetchStatewiseCertificateData()
    }, []);

    function fetchStatewiseCertificateData() {
        axiosInstance.current.get(certificateAPI)
            .then(res => {
                setStateWiseCertificateData(res.data.numberOfCertificatesIssuedByState)
            });
    }

    const stateWiseTotalCertificateCount = () =>{
        let sum = 0;
        Object.keys(stateWiseCertificateData).map( data => sum = sum + stateWiseCertificateData[data])
        return sum;
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
            <DataTable
                    setSelectedData={setSelectedState}
                    selectedData={selectedState}
                    data={stateList}
                    title="ALL OF INDIA"
                    stateWiseCertificateData={stateWiseCertificateData}
                    total={stateWiseTotalCertificateCount()}
            />
            {districtList.length>0 ? <DataTable
                    setSelectedData={setSelectedDistrict}
                    selectedData={selectedDistrict}
                    data={districtList}
                    title={selectedState.name}
                    stateWiseCertificateData={stateWiseCertificateData}
                /> : '' }

        </div>
    );
}

export default Home;
