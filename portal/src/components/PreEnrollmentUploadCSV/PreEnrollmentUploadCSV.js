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

function PreEnrollmentUploadCSV({sampleCSV, fileUploadAPI, onUploadComplete}) {
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [programList, setProgramList] = useState([]);
    const [program, setProgram] = useState("");
    const {keycloak} = useKeycloak();
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
                alert("Successfully uploaded CSV");
            }, 500);
            onUploadComplete();
        }).catch((error) => {
            if (error.response && error.response.status === 400) {
                setUploadPercentage(0);
                alert(error.response.data["message"]);
            }
        })
    };

    return (
        <div className={styles['container']}>
            <div className="d-flex p-3" style={{width: "100%"}}>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="demo-simple-select-outlined-label">Select a program</InputLabel>
                    <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={program}
                        onChange={(evt)=>{setProgram(evt.target.value)}}
                        label="Program"
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
            </div>
            <div className={styles['progress-bar-container']}>
                <div className={styles['progress-bar']}>{uploadPercentage > 0 && `${uploadPercentage}%`}</div>
                <div>{uploadPercentage > 0 && <ProgressBar now={uploadPercentage} active/>}</div>
            </div>
        </div>
    );
}

export default PreEnrollmentUploadCSV
