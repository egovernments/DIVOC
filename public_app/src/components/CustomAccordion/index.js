import React, {useContext} from "react";
import {Accordion, AccordionContext, Card, useAccordionToggle} from "react-bootstrap";
import AccordionArrow from "../../assets/img/accordion_arrow.svg";
import {CustomButton} from "../CustomButton";

export function ContextAwareToggle({title, eventKey, callback, onTitleClick}) {
    const currentEventKey = useContext(AccordionContext);

    const decoratedOnClick = useAccordionToggle(
        eventKey,
        () => callback && callback(eventKey),
    );

    const isCurrentEventKey = currentEventKey === eventKey;

    return (
        <div className="user-select-none d-flex justify-content-between cursor-pointer align-items-center">
            <CustomButton isLink={true} type="submit" onClick={onTitleClick} className="p-0">
                <span>{title}</span>
            </CustomButton>
            <img onClick={decoratedOnClick} src={AccordionArrow} style={{transform: isCurrentEventKey ? "rotate(180deg)" : ""}}/>
        </div>
    );
}

export const CustomAccordion = ({children}) => {
    return (
        <Accordion defaultActiveKey="0">
            {
                children
            }
        </Accordion>
    )
}