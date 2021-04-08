import React, {useContext} from "react";
import {Accordion, AccordionContext, Card, useAccordionToggle} from "react-bootstrap";
import AccordionArrow from "../../assets/img/accordion_arrow.svg";

export function ContextAwareToggle({title, eventKey, callback}) {
    const currentEventKey = useContext(AccordionContext);

    const decoratedOnClick = useAccordionToggle(
        eventKey,
        () => callback && callback(eventKey),
    );

    const isCurrentEventKey = currentEventKey === eventKey;

    return (
        <div onClick={decoratedOnClick} className="user-select-none d-flex justify-content-between cursor-pointer align-items-center">
            <span>{title}</span>
            <img src={AccordionArrow} style={{transform: isCurrentEventKey ? "rotate(180deg)" : ""}}/>
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