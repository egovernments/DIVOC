import styles from './PreEnrollmentUploadCSV.module.css';
import './index.css'
import {ProgressBar} from 'react-bootstrap';
import React, {useEffect, useState} from 'react';
import axios from 'axios'
import {useKeycloak} from "@react-keycloak/web";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ToastComponent from "../Toast/Toast";
import Button from 'react-bootstrap/Button';

function PreEnrollmentUploadCSV({sampleCSV, fileUploadAPI, onUploadComplete,uploadHistoryCount,handleShow,errorCount}) {
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [programList, setProgramList] = useState([]);
    const [program, setProgram] = useState("");
    const {keycloak} = useKeycloak();
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        getListOfRegisteredPrograms();
    }, []);
    const getListOfRegisteredPrograms = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${keycloak.token} `,
                "Content-Type": "application/json",
            },
        };
        let res = await axios
            .get("/divoc/admin/api/v1/programs", config)
            .then((res) => {
                return res.data
            });
        res = res.map(r => ({...r}));
        setProgramList(res)
    };
    const uploadFile = (evt) => {
        if(program === "") {
            alert("Select a program");
            return
        }
        const fileData = evt.target.files[0];
        let dataToSend = new FormData();
        dataToSend.append('file', fileData);
        dataToSend.append('programId', program);

        const config = {
            headers: {"Authorization": `Bearer ${keycloak.token} `, "Content-Type": "application/json"},
            onUploadProgress: (progressEvent) => {
                const {loaded, total} = progressEvent;
                let percent = Math.floor((loaded * 100) / total);
                setUploadPercentage(percent)
            }
        };
        setUploadPercentage(1);
        axios.post(fileUploadAPI, dataToSend, config).then(res => {
            setTimeout(() => {
                setUploadPercentage(0);
                setShowToast(true);
            }, 500);
            onUploadComplete();
        }).catch((error) => {
            if (error.response && error.response.status === 400) {
                setUploadPercentage(0);
                alert(error.response.data["message"]);
            }
        })
    };

    function uploadingToastBody () {
        return(
            <div>
                <span>File Uploaded</span>&emsp;
                <ProgressBar variant="success" now={uploadPercentage} active/>
                <span>{uploadPercentage > 0 && `${uploadPercentage}%`}</span>
            </div>
        )
    }

    function uploadedToastBody() {
        return(
            <div className="d-flex justify-content-between">
                <p>{errorCount} Errors Found</p>
                <Button style={{background: "#FC573B"}} onClick={()=>{handleShow()}}>VIEW</Button>
            </div>
        )
    }

    return (
        <div className={styles['container'] + " d-flex justify-content-between"}>
            <FormControl variant="outlined" fullWidth>
                <InputLabel id="demo-simple-select-outlined-label">Select a program</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={program}
                    onChange={(evt)=>{setProgram(evt.target.value)}}
                    label="Program"
                    className={styles['form']}
                >
                <MenuItem value="">
                    <em>Please select</em>
                </MenuItem>
                {
                    programList.map((group, index) => (
                        <MenuItem value={group.name} name={group.name}>{group.name}</MenuItem>

                    ))
                }

                </Select>
            </FormControl>
            <div className={styles['progress-bar-container']}>
            {uploadPercentage>0 && <ToastComponent header={uploadHistoryCount} toastBody={uploadingToastBody()} />}
            </div>
            {showToast && <ToastComponent header={uploadHistoryCount} toastBody={uploadedToastBody()} />}
            { program && <div>
                <input
                    type='file'
                    id='actual-btn'
                    onChange={(evt) =>
                        uploadFile(evt)
                    }
                    value={""}
                    accept=".csv"
                    hidden
                    required
                    onClick={(evt) => {
                        if(program === "") {
                            alert("Select a program");
                            evt.preventDefault()
                        }
                    }}
                />
                <label
                    htmlFor='actual-btn'
                    className={styles['button']}
                >
                    UPLOAD CSV
                </label>
                {sampleCSV && <div className="sample-link">
                    <a href={sampleCSV} download>
                        Download sample CSV
                    </a>
                </div>}
            </div>}
        </div>
    );
}

export default PreEnrollmentUploadCSV
