import React, {useEffect, useState} from "react";
import "./VaccinatorDetails.css"
import {isEmpty} from "ramda";
import TextField from "@material-ui/core/TextField";
import searchImg from "../../../assets/img/search.svg";
import InputAdornment from "@material-ui/core/InputAdornment";
import {useAxios} from "../../../utils/useAxios";
import check from "../../../assets/img/check.png";


export default function VaccinatorDetails({selectedVaccinator, setEnableVaccinatorDetailView, fetchVaccinators}) {

    const [hasVaccinatorSelected, setHasVaccinatorSelected] = useState(!isEmpty(selectedVaccinator));
    const [vaccinator, setVaccinator] = useState({});
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);

    const axiosInstance = useAxios('');

    useEffect(() => {
        if (hasVaccinatorSelected) {
            setVaccinator(selectedVaccinator);
        } else {
            setVaccinator({
                name: "",
                code: "",
                mobileNumber: "",
                email: "",
                facilityIds: [],
                nationalIdentifier: "",
                status: "Inactive",
                signatures: [],
                averageRating:0,
                trainingCertificate:"",
                signatureString: ""
            })
        }
    }, []);

    function searchVaccinators() {
        console.log("TODO: wireup searching vaccinator")
    }

    function onValueChange(evt, field) {
        const data = {...vaccinator};
        data[field] = evt.target.value;
        setVaccinator(data)
    }

    function isVaccinatorValid(vaccinator) {
        if (vaccinator.name && vaccinator.email &&
            vaccinator.mobileNumber && vaccinator.nationalIdentifier && vaccinator.code) {
            return true;
        }
        return false;
    }

    function saveVaccinator() {
        if (isVaccinatorValid(vaccinator)) {
            axiosInstance.current.post('/divoc/admin/api/v1/vaccinator', vaccinator)
                .then(res => {
                    if (res.status === 200) {
                        setSavedSuccessfully(true);
                        setHasVaccinatorSelected(true);
                        fetchVaccinators();
                    }
                    else
                        alert("Something went wrong while saving!");
                });
        } else {
            alert("Please fill all the required values!")
        }
    }

    function editVaccinator() {
        if (isVaccinatorValid(vaccinator)) {
            axiosInstance.current.put('/divoc/admin/api/v1/vaccinators', vaccinator)
                .then(res => {
                    if (res.status === 200) {
                        setSavedSuccessfully(true);
                        fetchVaccinators();
                    }
                    else
                        alert("Something went wrong while saving!");
                });
        } else {
            alert("Please fill all the required values!")
        }
    }

    function exitDetailView() {
        setEnableVaccinatorDetailView(false)
    }

    return (
        <div>
            <div>
                <div className="container-button">
                    <h2>{hasVaccinatorSelected ? "Vaccinator Details" : "Add Vaccinator" }</h2>
                    <div>
                        {!hasVaccinatorSelected && <button className="add-vaccinator-button" onClick={saveVaccinator}>ADD</button>}
                        {hasVaccinatorSelected && <button className="add-vaccinator-button" onClick={editVaccinator}>EDIT</button>}
                        <button className="add-vaccinator-button" onClick={exitDetailView} >BACK</button>
                        {savedSuccessfully && <span><img src={check}/> <span className="saved-success">Details Saved</span></span>}
                    </div>
                </div>
                <div className="search-div">
                    <TextField id="outlined" label="Name" variant="outlined" />
                    <button disabled className="search-img"><img src={searchImg} alt={""} onClick={searchVaccinators}/></button>
                </div>
            </div>
            <div className="personal-details-div">
                <h3>Personal Details</h3>
                <TextField className="vaccinator-input" required value={vaccinator.name} onChange={(evt) => onValueChange(evt, "name")} label="Name" variant="outlined"/>
                <TextField required value={vaccinator.email} onChange={(evt) => onValueChange(evt, "email")} label="Email" variant="outlined"/>
                <TextField
                    required
                    value={vaccinator.mobileNumber}
                    onChange={(evt) => onValueChange(evt, "mobileNumber")}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                    }}
                    label="Mobile" variant="outlined"/>
                <TextField required value={vaccinator.nationalIdentifier} onChange={(evt) => onValueChange(evt, "nationalIdentifier")} label="Aadhaar" variant="outlined"/>
                <TextField required value={vaccinator.code} onChange={(evt) => onValueChange(evt, "code")} label="Licence Number" variant="outlined"/>
                <TextField value={vaccinator.signatureString} onChange={(evt) => onValueChange(evt, "signatureString")} label="Signature" variant="outlined"/>
            </div>
        </div>
    );
}
