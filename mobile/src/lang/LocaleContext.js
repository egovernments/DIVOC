import React, {useContext, useState} from 'react';
import {FormattedMessage, FormattedNumber, IntlProvider, useIntl} from 'react-intl';
import Hindi from '../lang/hi.json';
import English from '../lang/en.json';
import Arabic from '../lang/ar.json';

const LocaleContext = React.createContext(null);

const local = localStorage.getItem("language") || navigator.language;

let lang;
if (local === 'hi') {
    lang = Hindi;
} else if (local === 'ar') {
    lang = Arabic;
} else {
    lang = English;
}

export function LocaleProvider(props) {
    const [locale, setLocale] = useState(local);
    const [messages, setMessages] = useState(lang);

    function selectLanguage(newLocale) {
        setLocale(newLocale);

        if (newLocale === 'hi') {
            setMessages(Hindi);
        } else if (newLocale === 'ar') {
            setMessages(Arabic);
        } else {
            setMessages(English);
        }
        localStorage.setItem("language", newLocale)
    }

    return (
        <LocaleContext.Provider value={{locale, selectLanguage}}>
            <IntlProvider messages={messages} locale={locale}>
                {props.children}
            </IntlProvider>
        </LocaleContext.Provider>

    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    const intl = useIntl();
    const {selectLanguage} = context;
    const currentLocale = () => {
        return localStorage.getItem("language") || navigator.language
    }

    const getText = (key) => intl.formatMessage({id: key})
    return {
        selectLanguage,
        currentLocale,
        getText
    }
}

export function getMessageComponent(id, defaultMessage) {
    return <FormattedMessage id={id} defaultMessage={defaultMessage || ""}/>
}

export function getNumberComponent(number) {
    return <FormattedNumber value={number}/>
}

export const LANGUAGE_KEYS = Object.freeze({
    HOME: "app.home",
    QUEUE: "app.queue",
    LANGUAGE: "app.language",
    HELP: "app.help",
    PROGRAM: "app.program",
    LOGOUT: "app.logout",
    PROFILE: "app.profile",
    ACTIONS: "app.actionTitle",
    RECIPIENT_NUMBERS: "app.recipientDetailsTitle",
    ENROLLMENT_TODAY: "app.enrollmentToday",
    SELECT_LANGUAGE: "app.selectLanguage",
    SELECT_PROGRAM: "app.selectProgram",
    VERIFY_RECIPIENT: "app.verifyRecipient",
    ENROLL_RECIPIENT: "app.enrollRecipient",
    RECIPIENT_QUEUE: "app.recipientQueue",
    RECIPIENT_WAITING: "app.recipientWaiting",
    CERTIFICATE_ISSUED: "app.certificateIssued",
    ENTER_IDENTITY_NUMBER: "app.enterIdentityNumber",
    REGISTER_IDENTITY_NUMBER: "app.registerIdentityNumber",
    SCAN_IDENTITY_NUMBER: "app.scanIdentityNumber",
    LIMIT_REACH_MESSAGE: "app.limitReachMessage",
    RECIPIENTS_ENROLLED: "app.recipientsEnrolled",
    EXCEED_LIMITS: "app.exceedLimits",
    NAME: "app.name",

    VERIFY_RECIPIENT_ENTER_MOBILE_AND_VERIFICATION_CODE: "app.verifyRecipient.enterMobileAndVerificationCode",
    VERIFY_RECIPIENT_CONFIRM_BUTTON: "app.verifyRecipient.confirmButton",
    RECIPIENT_QUEUE_MESSAGE: "app.recipientQueue.message",
    RECIPIENT_QUEUE_STATUS: "app.recipientQueue.status",
    RECIPIENT_QUEUE_NUMBER: "app.recipientQueue.number",
    RECIPIENT_QUEUE_TITLE: "app.recipientQueue.title",

    PROFILE_LAST_LOGGED_IN: "app.profile.lastLoggedIn",
    PROFILE_LAST_SYNC: "app.profile.lastSync",
    PROFILE_FACILITY: "app.profile.facility",
    PROFILE_CONFIRM_LOGOUT_MESSAGE: "app.profile.confirmLogout.message",
    PROFILE_CONFIRM_LOGOUT_OK: "app.profile.confirmLogout.ok",
    PROFILE_CONFIRM_LOGOUT_CANCEL: "app.profile.confirmLogout.cancel",

    PRE_ENROLLMENT_TITLE: "app.preenrollment.title",
    PRE_ENROLLMENT_DETAILS: "app.preenrollment.details",
    PRE_ENROLLMENT_ENTER_MANUALLY: "app.preenrollment.enterManually",
    PRE_ENROLLMENT_NO_PATIENTS: "app.preenrollment.noPatient",
    PRE_ENROLLMENT_ENTER_OTP: "app.preenrollment.enterOTP",

    ENROLLMENT_TITLE: "app.enrollment.title",
    ENROLLMENT_NAME: "app.enrollment.name",
    ENROLLMENT_SELECT_GENDER: "app.enrollment.gender",
    ENROLLMENT_NATIONALITY: "app.enrollment.nationalId",
    ENROLLMENT_DOB: "app.enrollment.dob",
    ENROLLMENT_EMAIL: "app.enrollment.email",
    ENROLLMENT_MOBILE: "app.enrollment.phone",
    ENROLLMENT_IDENTITY_TYPE: "app.enrollment.identityType",
    ENROLLMENT_IDENTITY_NO: "app.enrollment.identityValue",
    ENROLLMENT_ADDRESS_1: "app.enrollment.addressLine1",
    ENROLLMENT_STATE: "app.enrollment.state",
    ENROLLMENT_DISTRICT: "app.enrollment.district",
    ENROLLMENT_LOCALITY: "app.enrollment.locality",
    ENROLLMENT_PINCODE: "app.enrollment.pincode",

    PAYMENT_TITLE: "app.payment.title",
    PAYMENT_GOVT: "app.payment.govt",
    PAYMENT_VOUCHER: "app.payment.voucher",
    PAYMENT_DIRECT: "app.payment.direct",

    BUTTON_DONE: "app.button.done",
    BUTTON_NEXT: "app.button.next",
    BUTTON_CONFIRM: "app.button.confirm",
    BUTTON_SEND_FOR_VACCINATION: "app.button.sendvaccination",
    BUTTON_OTP: "app.button.otp",
    BUTTON_VERIFY: "app.button.verify",

    VACCINATION_TITLE: "app.vaccination.title",
    VACCINATION_VACCINATOR: "app.vaccination.vaccinator",
    VACCINATION_VACCINE: "app.vaccination.vaccine",
    VACCINATION_BATCH_ID: "app.vaccination.batchId",
    VACCINATION_DOSE: "app.vaccination.dose",
});
