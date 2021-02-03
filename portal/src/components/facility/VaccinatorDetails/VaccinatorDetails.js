import React, {useEffect, useState} from "react";
import "./VaccinatorDetails.css"
import {append, equals, isEmpty, reject} from "ramda";
import TextField from "@material-ui/core/TextField";
import searchImg from "../../../assets/img/search.svg";
import InputAdornment from "@material-ui/core/InputAdornment";
import {useAxios} from "../../../utils/useAxios";
import check from "../../../assets/img/check.png";
import DropDown from "../../DropDown/DropDown";
import {API_URL} from "../../../utils/constants";
import withStyles from "@material-ui/core/styles/withStyles";
import Switch from "@material-ui/core/Switch/Switch";
import SearchVaccinatorResultsView from "../SearchVaccinatorResults/SearchVaccinatorResultsView";


export default function VaccinatorDetails({
      selectedVaccinator, setEnableVaccinatorDetailView, onSelectVaccinatorBasedOnCode, facilityCode
}) {

    const [hasVaccinatorSelected, setHasVaccinatorSelected] = useState(false);
    const [vaccinator, setVaccinator] = useState({});
    const [savedSuccessfully, setSavedSuccessfully] = useState(false);
    const [updatedVaccinatorFields, setUpdatedVaccinatorFields] = useState({});
    const [selectedProgram, setSelectedProgram] = useState({});
    const [programs, setPrograms] = useState([]);
    const [searchVaccinatorName, setSearchVaccinatorName] = useState('');
    const [searchVaccinatorResults, setSearchVaccinatorResults] = useState([]);
    const [togglePopup, setTogglePopup] = useState(false);

    const axiosInstance = useAxios('');

    useEffect(() => {
        setHasVaccinatorSelected(!isEmpty(selectedVaccinator));
        if (!isEmpty(selectedVaccinator)) {
            setVaccinator(selectedVaccinator);
            setUpdatedVaccinatorFields({})
        } else {
            setVaccinator({
                name: "",
                code: "",
                mobileNumber: "",
                email: "",
                facilityIds: [],
                nationalIdentifier: "",
                status: "Active",
                signatures: [],
                averageRating:0,
                trainingCertificate:"",
                signatureString: "",
                programs: []
            });
            setUpdatedVaccinatorFields({})
        }
        fetchPrograms();
        setSelectedProgram({});
    }, [selectedVaccinator]);

    function fetchPrograms() {
        let params = {
            programStatus: "Active",
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);
        axiosInstance.current.get(API_URL.FACILITY_API, {params: queryParams})
            .then(res => {
                res.data.forEach(item => {
                    if (!("programs" in item)) {
                        setPrograms([]);
                    } else {
                        let programsAsSet = new Set(programs);
                        let data = new Array(...programsAsSet);
                        item.programs.map(p => {
                            if (!programsAsSet.has(p.programId) && !data.includes(p.programId)) {
                                data.push(p.programId);
                            }
                        });
                        setPrograms(data)
                    }
                });
            });
    }

    function searchVaccinators() {
        let params = {
            name: searchVaccinatorName,
            facilityCode: "ALL"
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);
        axiosInstance.current.get(API_URL.VACCINATORS_API, {params: queryParams})
            .then(res => {
                setSearchVaccinatorResults(res.data.filter(v => !v.facilityIds.includes(facilityCode)));
                setTogglePopup(!togglePopup);
            });
    }

    function onValueChange(evt, field) {
        setUpdatedVaccinatorFields({...updatedVaccinatorFields, [field]: evt.target.value});
        setVaccinator({...vaccinator, [field]: evt.target.value})
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
            const data = {...vaccinator};
            if (selectedProgram.id) {
                data.programs = [selectedProgram]
            }
            axiosInstance.current.post('/divoc/admin/api/v1/vaccinator', data)
                .then(res => {
                    if (res.status === 200) {
                        onSuccessfulSave()
                    }
                    else
                        alert("Something went wrong while saving!");
                });
        } else {
            alert("Please fill all the required values!")
        }
    }

    function editVaccinator() {
        if (isVaccinatorValid(vaccinator) && vaccinator.osid) {
            const editData = {...updatedVaccinatorFields};
            if (editData) {
                editData['osid'] = vaccinator.osid;
                if (selectedProgram.id && !vaccinator.programs.filter(p => p.id === selectedProgram.id).length > 0) {
                    editData['programs'] = vaccinator.programs.concat(selectedProgram)
                } else {
                    editData['programs'] = vaccinator.programs
                }
                axiosInstance.current.put(API_URL.VACCINATORS_API, [editData])
                    .then(res => {
                        if (res.status === 200) {
                            onSuccessfulSave()
                        }
                        else
                            alert("Something went wrong while saving!");
                    });
            }
        } else {
            alert("Please fill all the required values!")
        }
    }

    const onSuccessfulSave = () => {
        setSavedSuccessfully(true);
        setEnableVaccinatorDetailView(true);
        setTimeout(() => onSelectVaccinatorBasedOnCode(vaccinator.code), 2000);
    };

    function exitDetailView() {
        setEnableVaccinatorDetailView(false)
    }

    const CustomSwitch = withStyles({
        switchBase: {
            '&$checked': {
                color: "#88C6A9",
            },
            '&$checked + $track': {
                backgroundColor: "#88C6A9",
            },
        },
        checked: {},
        track: {},
    })(Switch);

    function onProgramCertifyChange(program, certified) {
        program.certified = certified;
        let updatedPrograms = vaccinator.programs.map(p => {
            if (p.id === program.id) {
                p.certified = program.certified
            }
            return p
        });

        setUpdatedVaccinatorFields({...updatedVaccinatorFields, "programs": updatedPrograms});
        setVaccinator({...vaccinator, "programs": updatedPrograms})
    }

    function onAddProgramChange(value) {
        let program = {
            id: value,
            certified: false
        };
        setSelectedProgram(program);
    }

    function onAddProgramCertify(value) {
        setSelectedProgram({...selectedProgram, "certified": value})
    };

    return (
        <div>
            <div className="row">
                <div className="col-sm-8"><h2>{hasVaccinatorSelected ? "Vaccinator Details" : "Add Vaccinator" }</h2></div>
                <div className="col-sm-4">
                    {savedSuccessfully && <span><img src={check}/> <span className="saved-success">Details Saved</span></span>}
                    {!hasVaccinatorSelected && <button className="add-vaccinator-button" onClick={saveVaccinator}>ADD</button>}
                    {hasVaccinatorSelected && <button className="add-vaccinator-button" onClick={editVaccinator}>SAVE</button>}
                    <button className="add-vaccinator-button" onClick={exitDetailView} >BACK</button>
                </div>
            </div>
            {
                !hasVaccinatorSelected &&
                <div className="row search-div">
                    <TextField label="small" value={searchVaccinatorName} onChange={(evt) => setSearchVaccinatorName(evt.target.value)} id="outlined" label="Name" variant="outlined" />
                    <button disabled={!searchVaccinatorName} className="search-img" onClick={searchVaccinators} ><img src={searchImg} alt={""} /></button>
                    <SearchVaccinatorResultsView
                        vaccinators={searchVaccinatorResults}
                        togglePopup={togglePopup}
                        setTogglePopup={setTogglePopup}
                        onSelectVaccinatorBasedOnCode={onSelectVaccinatorBasedOnCode}
                        facilityCode={facilityCode}
                    />
                </div>
            }
            <div className="row">
                <div className="col-sm-8 personal-details-div">
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
                    <TextField required value={vaccinator.nationalIdentifier} onChange={(evt) => onValueChange(evt, "nationalIdentifier")} label="National Identifier" variant="outlined"/>
                    <TextField required value={vaccinator.code} onChange={(evt) => onValueChange(evt, "code")} label="Licence Number" variant="outlined"/>
                    <TextField value={vaccinator.signatureString} onChange={(evt) => onValueChange(evt, "signatureString")} label="Signature" variant="outlined"/>
                </div>
                <div className="col-sm-4 program-details-div">
                    <h3>Training & Certification</h3>
                    {
                        vaccinator.programs &&
                            vaccinator.programs.map(program => (
                                <div className="row vaccinator-prg-div">
                                    <span className="col-sm-7 vaccinator-prg-span">{program.id}</span>
                                    <CustomSwitch
                                        checked={program.certified}
                                        onChange={() => onProgramCertifyChange(program, !program.certified)}
                                        color="primary"
                                    />
                                    <span className="vaccinator-prg-span">Certified</span>
                                </div>
                            ))
                    }
                    <div>
                        <span className="filter-header">Certification (if any)</span>
                        <DropDown
                            options={programs}
                            placeholder="Please select Program"
                            setSelectedOption={onAddProgramChange}
                        />
                        <div>
                            <span>Certified</span>
                            <CustomSwitch
                                checked={selectedProgram.certified}
                                onChange={() => onAddProgramCertify(!selectedProgram.certified)}
                                color="primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
