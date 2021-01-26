import React, {useContext, useState} from 'react';
import {FormattedMessage, FormattedNumber, IntlProvider} from 'react-intl';
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
    const {selectLanguage} = context;
    const currentLocale = () => {
        return localStorage.getItem("language") || navigator.language
    }
    return {
        selectLanguage,
        currentLocale
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
    ACTIONS: "app.actionTitle",
    RECIPIENT_NUMBERS: "app.recipientDetailsTitle",
    ENROLLMENT_TODAY: "app.enrollmentToday",
    SELECT_LANGUAGE: "app.selectLanguage",
    SELECT_PROGRAM: "app.selectProgram",
    VERIFY_RECIPIENT: "app.verifyRecipient",
    ENROLL_RECIPIENT: "app.enrollRecipient",
    RECIPIENT_QUEUE: "app.recipientQueue",
    PROGRAM_NAME: "app.programName",
    RECIPIENT_WAITING: "app.recipientWaiting",
    CERTIFICATE_ISSUED: "app.certificateIssued",
    ENTER_IDENTITY_NUMBER: "app.enterIdentityNumber",
    REGISTER_IDENTITY_NUMBER: "app.registerIdentityNumber",
    SCAN_IDENTITY_NUMBER: "app.scanIdentityNumber",
    LIMIT_REACH_MESSAGE: "app.limitReachMessage"
});
