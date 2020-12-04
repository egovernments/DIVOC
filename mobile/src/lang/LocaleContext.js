import React, {useContext, useState} from 'react';
import {FormattedMessage, FormattedNumber, IntlProvider} from 'react-intl';
import Hindi from '../lang/hi.json';
import English from '../lang/en.json';
import Arabic from '../lang/ar.json';

const LocaleContext = React.createContext(null);

const local = navigator.language;

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
    return {
        selectLanguage
    }
}


export function getMessageComponent(id, defaultMessage) {
    return <FormattedMessage id={id} defaultMessage={defaultMessage || ""}/>
}

export function getNumberComponent(number) {
    return <FormattedNumber value={number}/>
}
