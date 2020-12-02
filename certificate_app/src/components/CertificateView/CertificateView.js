import React from "react";
import axios from "axios";
import { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useState } from "react";
import styles from "./CertificateView.module.css";
import Table from "react-bootstrap/Table";
import DownloadLogo from '../../assets/img/download-icon.svg';

function CertificateView() {
    const { keycloak } = useKeycloak();
    const [certificateList, setCertificateList] = useState([]);
    const [checked, setChecked] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const ref = React.createRef();

    const config = {
        headers: {
            Authorization: `Bearer ${keycloak.token} `,
            "Content-Type": "application/json",
        },
    };

    useEffect(() => {
        getCertificate();
    }, []);

    const getCertificate = async () => {
        const response = await axios
            .get("/divoc/api/v1/certificates/2343243439", config)
            .then((res) => {
                return res.data;
            });
        console.log(response)
        setCertificateList(response);
    };

    const handChange = (data) => {
        setChecked(!checked);
        setCertificateData(data);
    };

    const getListOfCertificateBearers = () => {
        return certificateList.map((data) => {
            return (
                <div className={styles["radio"]}>
                    <input
                        type="radio"
                        id="person"
                        name={data}
                        checked={checked}
                        onChange={(e) => handChange(data)}
                    ></input>
                    <span className={styles["radio"]}>{data.name}</span>
                </div>
            );
        });
    };


    const showCertificatePreview = () => {
        return (
            <Table borderless>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <td>{certificateData.name}</td>
                    </tr>
                    <tr>
                        <th>Conatact</th>
                        <td>{certificateData.contact}</td>
                    </tr>
                </tbody>
            </Table>
        );
    };

    const handleClick = () => {
        console.log(certificateData)
    }


    return (
        <div className={styles["container"]}>
            <div>
                <p>You are downloading C-19 Vaccination certificate</p>
                <h4>Please choose the patient</h4>
            </div>
            <div className={styles["sub-container"]}>
                <div className={styles["details"]}>
                    {getListOfCertificateBearers()}
                </div>
                <div className={styles["details"]}>
                    {checked ? (
                        <>
                            {showCertificatePreview()}
                            <button
                                className={styles["button"]}
                                onClick={handleClick}
                            >
                                Download Certificate
                                <img src={DownloadLogo} alt="download" />
                            </button>
                        </>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    );
}

export default CertificateView;
