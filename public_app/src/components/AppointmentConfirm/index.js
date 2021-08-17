import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {CustomConfirmPage} from "../CustomConfirmPage";
import {getNameOfTheId, getNationalIdType} from "../../utils/national-id";
import {Loader} from "../Loader";
import {useTranslation} from "react-i18next";

export const AppointmentConfirm = (props) => {
    const {state} = props.location;
    const {enrollment_code} = props.match.params;
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const {t} = useTranslation();

    return (
        <>
            {isLoading && <Loader/>}
            <CustomConfirmPage onDone={() => {
                setIsLoading(true);
                setTimeout(() => {
                    history.push("/registration")
                }, 5000)
            }
            }>

                <h2 className="">{t('appointment.success.title', {program: state.program.name || "Covid 19 program"})}</h2>
                <h2 className="mt-5 mb-5">{t('appointment.success.enrollmentCode', {enrollmentCode: enrollment_code})}</h2>
                <span style={{fontSize: "18px", marginBottom: "1rem"}}>{t('appointment.success.enrollmentDetails')}</span>
                <span style={{
                    fontSize: "18px",
                    marginBottom: "1rem"
                }}>
                    {t('registration.success.vaccinationInfo', {identity: getNameOfTheId(getNationalIdType(state.identity))})}
                </span>
            </CustomConfirmPage>
        </>
    )
};
