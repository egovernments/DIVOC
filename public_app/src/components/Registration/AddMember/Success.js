import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {maskPersonalDetails} from "../../../utils/maskPersonalDetails";
import {CustomConfirmPage} from "../../CustomConfirmPage";
import {getNameOfTheId, getNationalIdType} from "../../../utils/national-id";
import {Loader} from "../../Loader";
import {useTranslation} from "react-i18next";

export const Success = ({formData, programs}) => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const {t} = useTranslation();

    let programName = programs.filter(p => p.osid === formData.programId)[0].name
    return (
        <>
            {isLoading && <Loader/>}
            <CustomConfirmPage onDone={() => {
                setIsLoading(true)
                setTimeout(() => {
                    history.push("/registration")
                }, 5000)
            }}>
                <h3>{t('registration.success.title', {programName: programName ? programName : ''})}</h3>
                <div className="pt-3">
                    <h4>{t('registration.beneficiaryName')}: {formData.name}</h4>
                </div>
                <div className="pt-3">
                    <p>
                        {t('registration.success.enrollmentDetails')}<br/>
                        {formData.email ? maskPersonalDetails(formData.email).concat(" and ") : ''}
                        {maskPersonalDetails(formData.contact)}
                    </p>
                </div>
                <div className="pt-3">
                    <p>
                        {t('registration.success.vaccinationInfo', {identity: getNameOfTheId(getNationalIdType(formData.identity))})}
                    </p>
                </div>
            </CustomConfirmPage>
        </>
    )
}
