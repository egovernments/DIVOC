import React from "react";
import "./LanguageSelection.scss"
import {Card} from "react-bootstrap";
import {getMessageComponent, LANGUAGE_KEYS, useLocale} from "../lang/LocaleContext";
import {BaseFormCard} from "../components/BaseFormCard";

const languageSupports = [
    {
        languageName: "English",
        languageCode: "en"
    },
    {
        languageName: "Hindi",
        languageCode: "hi"
    }
    //ADD more languages here
]


export function SelectLanguage(props) {
    const {selectLanguage, currentLocale} = useLocale();
    const currentSelectedLocale = currentLocale();
    const onLanguageSelected = (lang) => {
        selectLanguage(lang)
    }
    return (
        <div className={"language-container"}>
            <BaseFormCard title={getMessageComponent(LANGUAGE_KEYS.SELECT_LANGUAGE)}>
                {languageSupports.map((item, index) => {
                    return <LanguageItem
                        key={item.languageCode}
                        name={item.languageName}
                        selected={item.languageCode === currentSelectedLocale}
                        onClick={() => onLanguageSelected(item.languageCode)}>
                        {item.languageName}
                    </LanguageItem>
                })}
            </BaseFormCard>
        </div>
    );
}

function LanguageItem(props) {
    return (
        <div className={`language-item ${props.selected ? 'active' : ''}`} onClick={props.onClick}>
            <Card.Header className="d-flex justify-content-between">
                <div className='title'>{props.name}</div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0z" fill='none'/>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                          fill={`${props.selected ? '#5C9EF8' : ''}`}/>
                </svg>
            </Card.Header>
        </div>
    );
}
