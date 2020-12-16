import React, { useEffect, useState } from "react";
import styles from "./MapView.module.css";
import certificate_data from "../../DummyData/certificate_data.json";
import LeafletMap from "../IndiaMap/LeafletMap";

function Home() {
    const [tableData, setTableData] = useState(certificate_data);
    const [selectedState, setSelectedState] = useState([
        { name: "", count: 0 },
    ]);

    const STATE_NAMES = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttarakhand",
        "Uttar Pradesh",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry",
    ];

    const handleRowClick = (data) => {
        setSelectedState({name : data,count: certificate_data[data]});
    };

    const getTableData = () => {
        return STATE_NAMES.map((state) => {
            return (
                <tr
                    style={
                        selectedState.name === state
                            ? { background: "#CEE5FF" }
                            : { background: "white" }
                    }
                    onClick={() => handleRowClick(state)}
                >
                    <td>{state}</td>
                    <td>{certificate_data[state]}</td>
                </tr>
            );
        });
    };

    return (
        <div className={styles["container"]}>
            <div className={styles["map-container"]}>
                <LeafletMap
                    setSelectedState={setSelectedState}
                    selectedState={selectedState}
                />
            </div>
            <div className={styles['table-container']}>
                <table
                    className="table table-borderless table-hover"
                >
                    <thead className={styles['thead']}>
                        <tr>
                            <td >ALL OF INDIA</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>{getTableData()}</tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;
