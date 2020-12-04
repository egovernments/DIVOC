import React, {useState} from "react";
import {BaseCard} from "../Base/Base";
import "./Language.scss"
import {Button} from "react-bootstrap";
import {FormattedMessage, FormattedNumber} from "react-intl";
import * as PropTypes from "prop-types";
import {useLocale} from "../lang/LocaleContext";


function LanguageSelection(props) {
    return <div className={"language-container"}>
        <h1 className={"title"}><FormattedMessage id={"app.selectLanguage"} defaultMessage={"Hello"}/></h1>
        <h1 className={"title"}><FormattedNumber value={106}/></h1>
        <Button onClick={props.onClick}>Change to hindi</Button>
        <Button onClick={props.onClick1}>Change to English</Button>
        <Button onClick={props.onClick2}>Change to Arabic</Button>
    </div>;
}

LanguageSelection.propTypes = {
    onClick: PropTypes.func,
    onClick1: PropTypes.func
};

export function SelectLanguage(props) {
    const locale = useLocale()
    return (
        <BaseCard>
            <LanguageSelection onClick={() => {
                locale.selectLanguage("hi")
            }} onClick1={() => {
                locale.selectLanguage("en")
            }} onClick2={() => {
                locale.selectLanguage("ar")
            }}/>
        </BaseCard>
    );

}
