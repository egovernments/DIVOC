import React, {useEffect, useState} from "react";
import {TabPanels} from "../TabPanel/TabPanel";
import {useAxios} from "../../utils/useAxios";
import {CustomDateWidget} from "../CustomDateWidget";
import {UploadHistoryTable} from "../UploadHistoryTable";
import {formatDate, formatYYYYMMDDDate, ordinal_suffix_of} from "../../utils/dateutil";
import {equals, reject} from "ramda";
import keycloak from "../../utils/keycloak";
import {API_URL} from "../../utils/constants";

export const BENEFICIARY_TYPE = Object.freeze({
    PAST: "past",
    TODAY: "today",
    UPCOMING: "upcoming"
});

export default function Beneficiaries() {
    const [programs, setPrograms] = useState([]);
    const [facilityCode, setFacilityCode] = useState([]);
    const axiosInstance = useAxios('');

    useEffect(() => {
        fetchPrograms();
        keycloak.loadUserProfile()
            .then(res => {
                setFacilityCode(res["attributes"]["facility_code"][0]);
            })
    }, []);

    function fetchPrograms() {
        axiosInstance.current.get('/divoc/admin/api/v1/public/programs?status=Active')
            .then(res => {
                if (res.status === 200) {
                    let programs = res.data.filter(p => new Date(p.endDate + " 00:00") - new Date() > 0)
                    setPrograms(programs);
                }
            })
            .catch(e => {
                console.log(e);
                setPrograms([])
            })
    }
    return (
        <div className="vaccinator-list-container">
            <TabPanels tabs={[
                {title: "Past", component: <BeneficiaryList programs={programs} type={BENEFICIARY_TYPE.PAST}  facilityCode={facilityCode} />},
                {title: "Today", component: <BeneficiaryList programs={programs} type={BENEFICIARY_TYPE.TODAY} facilityCode={facilityCode}/>},
                {title: "Upcoming", component: <BeneficiaryList programs={programs} type={BENEFICIARY_TYPE.UPCOMING}  facilityCode={facilityCode} />},
            ]}
            />
        </div>
    );
}

function BeneficiaryList({programs, type, facilityCode}) {
    const today = new Date();
    const yesterday = new Date().setDate(new Date().getDate() - 1);
    const tomorrow = new Date().setDate(new Date().getDate() + 1);

    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [options, setOptions] = useState({});
    const [tableData, setTableData] = useState([]);
    const [emptyMessage, setEmptyMessage] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState({});

    const axiosInstance = useAxios('');

    const HeaderData = [
        {
            title: "ENROLLMENT ID",
            key: "enrollmentId"
        },
        {
            title: "BENEFICIARY NAME",
            key: "name"
        },
        {
            title: "DOSE",
            key: "dose"
        }
    ];
    if (type === BENEFICIARY_TYPE.PAST) {
        HeaderData.push(
            {
                title: "DATE OF VACCINATION",
                key: "vaccinationDate"
            }
        )
    }  else if (type === BENEFICIARY_TYPE.UPCOMING) {
        HeaderData.push(
            {
                title: "DATE OF APPOINTMENT",
                key: "appointmentDate"
            }
        );
    } else if (type === BENEFICIARY_TYPE.TODAY) {
        HeaderData.push(
            {
                title: "STATUS",
                key: "status"
            }
        );
    }

    useEffect(() => {
        // reset data
        setTableData([]);
        setEmptyMessage("");
        setShowDetails(false);
        setSelectedBeneficiary({});

        if (type === BENEFICIARY_TYPE.PAST) {
            setOptions({'maxDate': yesterday});
            setStartDate(formatYYYYMMDDDate(yesterday));
            setEndDate(formatYYYYMMDDDate(yesterday))
        } else if (type === BENEFICIARY_TYPE.UPCOMING) {
            setOptions({'minDate': tomorrow});
            setStartDate(formatYYYYMMDDDate(tomorrow));
            setEndDate(formatYYYYMMDDDate(tomorrow))
        } else if (type === BENEFICIARY_TYPE.TODAY) {
            setOptions({'minDate': today, 'maxDate': today});
            setStartDate(formatYYYYMMDDDate(today));
            setEndDate(formatYYYYMMDDDate(today))
        }
        if (programs.length > 0) {
            setSelectedProgramId(programs[0].osid)
        }
    }, [type]);

    function onProgramChange(osid) {
        setSelectedProgramId(osid)
    }

    function convertToRowData(reqBody) {
        let results = [];
        reqBody.map(beneficiary => {
            beneficiary.appointments.map(appointment => {
                if (type === BENEFICIARY_TYPE.PAST) {
                    // ex: appointment.osUpdatedAt = "2021-04-28T19:22:48.198Z"
                    let certifiedDate = new Date(appointment.osUpdatedAt);
                    if (facilityCode === appointment.enrollmentScopeId && appointment.certified &&
                        certifiedDate >= new Date(startDate) && certifiedDate <= new Date(endDate+ " 23:59:59")) {
                        results.push({
                            "enrollmentId": beneficiary.code,
                            "name": beneficiary.name,
                            "dose": appointment.dose,
                            "vaccinationDate": formatDate(certifiedDate),
                            "appointmentDate": formatDate(new Date(appointment.appointmentDate)),
                            "certificateId": appointment.certificateId ?? "",
                            "appointmentSlot": appointment.appointmentSlot
                        })
                    }
                } else if (type === BENEFICIARY_TYPE.UPCOMING) {
                    // ex: appointment.appointmentDate = "2021-04-28"
                    let appointmentDate = new Date(appointment.appointmentDate);
                    if (facilityCode === appointment.enrollmentScopeId && !appointment.certified &&
                        appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate+ " 23:59:59")) {
                        results.push({
                            "enrollmentId": beneficiary.code,
                            "name": beneficiary.name,
                            "dose": appointment.dose,
                            "appointmentDate": formatDate(appointmentDate),
                            "appointmentSlot": appointment.appointmentSlot
                        })
                    }
                } else if (type === BENEFICIARY_TYPE.TODAY) {
                    let appointmentDate = new Date(appointment.appointmentDate);
                    let certifiedDate = new Date(appointment.osUpdatedAt);
                    if (facilityCode === appointment.enrollmentScopeId &&
                        (appointmentDate >= new Date(startDate) && appointmentDate <= new Date(endDate+ " 23:59:59") ||
                            certifiedDate >= new Date(startDate) && certifiedDate <= new Date(endDate+ " 23:59:59"))) {
                        results.push({
                            "enrollmentId": beneficiary.code,
                            "name": beneficiary.name,
                            "dose": appointment.dose,
                            "vaccinationDate": formatDate(certifiedDate),
                            "appointmentDate": formatDate(appointmentDate),
                            "status": appointment.certified ? "Vaccinated": "Open Appointment",
                            "certificateId": appointment.certificateId ?? "",
                            "appointmentSlot": appointment.appointmentSlot
                        })
                    }
                }
            })
        });
        setTableData(results);
    }

    function onSearch() {
        if (!setSelectedProgramId || !startDate || !endDate) {
            alert("please select all mandatory field")
        }
        let params = {
            startDate: startDate,
            endDate: endDate,
            programId: selectedProgramId,
            type: type === BENEFICIARY_TYPE.PAST ? "CERTIFIED" : type === BENEFICIARY_TYPE.UPCOMING ? "OPEN_APPOINTMENT" : "ALL"
        };
        params = reject(equals(''))(params);
        const queryParams = new URLSearchParams(params);
        axiosInstance.current.get(API_URL.BENEFICIARY_SEARCH_API, {params: queryParams})
            .then(res => {
                if (res.status === 200) {
                    convertToRowData(res.data)
                } else {
                    setEmptyMessage("No Beneficiaries Found")
                }
            })
            .catch(e => {
                console.log(e);
                setTableData([]);
                setEmptyMessage("No Beneficiaries Found")
            })
    }

    function onSelectBeneficiary(row) {
        setShowDetails(true);
        setSelectedBeneficiary(row);
    }

    function onSelectBeneficiaryBack() {
        setShowDetails(false);
        setSelectedBeneficiary({})
    }

    return (
        <div className="ml-4">
            { !showDetails && <>
                <div className="row">
                    <div className="mr-5">
                        <label className="custom-text-label required" htmlFor="program">Program</label>
                        <select style={{minWidth: "200px"}} className="form-control form-control-inline" id="yearSelect"
                                placeholder="Select"
                                onChange={(t) => onProgramChange(t.target && t.target.value)}>
                            <option disabled={true} >Select</option>
                            {
                                programs.map(x => {
                                    return <option key={x.osid} value={x.osid}>{x.name}</option>
                                })
                            }
                        </select>
                    </div>
                    <div className="mr-3">
                        <label className="custom-text-label required" htmlFor="startDate">Start Date</label>
                        <CustomDateWidget options={options} value={startDate} onChange={(value) => setStartDate(value)}/>
                    </div>
                    <div>
                        <label className="custom-text-label required" htmlFor="endDate">End Date</label>
                        <CustomDateWidget options={options} value={endDate} onChange={(value) => setEndDate(value)}/>
                    </div>
                    <div>
                        <button className='add-vaccinator-button mb-0' style={{marginTop: "34px"}} onClick={onSearch}>
                            SEARCH
                        </button>
                    </div>
                </div>
                <div>
                    {tableData.length > 0 && <h4>{tableData.length === 1 ? tableData.length + " Result": tableData.length + " Results"} </h4>}
                </div>
                <div>
                    { (tableData.length > 0 || emptyMessage) && <UploadHistoryTable
                        data={tableData}
                        headerData={HeaderData}
                        emptyListMessage={emptyMessage}
                        onCellClicked={(row) => onSelectBeneficiary(row)}
                    />}
                </div>
            </>}
            {showDetails && <BeneficiaryDetails data={selectedBeneficiary} onBack={onSelectBeneficiaryBack}/>}
        </div>
    )
}

function BeneficiaryDetails({data, onBack}) {
    const axiosInstance = useAxios('');
    const [certifiate, setCertificate] = useState({});

    function getCertificate(certificateId) {
        axiosInstance.current.get(API_URL.CERTIFICATE_API.replace(":id", certificateId))
            .then(res => {
                if (res.status === 200) {
                    setCertificate(res.data)
                }
            })
            .catch(e => {
                console.log(e);
            })
    }

    useEffect(() => {
        if (data.certificateId) {
            getCertificate(data.certificateId);
        }
    }, [data]);

    return (
        <div>
            <div className="row">
                <h3>Beneficiary Information</h3>
                <button className="add-vaccinator-button" style={{position:"absolute", right:"60px"}} onClick={onBack} >BACK</button>
            </div>
            <div className="row">
                <div className="col col-6 m-0">
                    <label className="custom-verify-text-label" htmlFor="endDate">Enrollment Number</label>
                    <p>{data.enrollmentId}</p>
                </div>
                <div className="col col-6 m-0">
                    <label className="custom-verify-text-label" htmlFor="endDate">Beneficiary Name</label>
                    <p>{data.name}</p>
                </div>
                <div className="col col-6 m-0">
                    <label className="custom-verify-text-label" htmlFor="endDate">
                        Date of {data.certificateId ? "Vaccination": "Appointment"}
                    </label>
                    <p>{data.certificateId ? data.vaccinationDate : data.appointmentDate}</p>
                </div>
                <div className="col col-6 m-0">
                    <label className="custom-verify-text-label" htmlFor="endDate">Dose</label>
                    <p>{ordinal_suffix_of(data.dose)} Dose</p>
                </div>
                {
                    data.certificateId && <div className="col col-6 m-0">
                        <label className="custom-verify-text-label" htmlFor="endDate">Vaccinator</label>
                        <p>{certifiate.certificate ? certifiate.certificate.evidence[0].verifier.name : ""}</p>
                    </div>
                }
                {
                    !data.certificateId && <div className="col col-6 m-0">
                        <label className="custom-verify-text-label" htmlFor="endDate">Appointment Slot</label>
                        <p>{data.appointmentSlot ? data.appointmentSlot : "-"}</p>
                    </div>
                }
            </div>
        </div>

    )
}
