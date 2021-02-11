import { Container } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import "./index.css"

const DAYS = ["Su", "M", "Tu", "W", "Th", "F", "Sa"]

function WeekDaysSelect({name, days, onChange, disabled}) {
    
    const [selected, setSelected] = useState(days ? [].concat(days) :[] );

    function handleClick(d) {
        if(!disabled) {
            const updatedSelection =  selected.includes(d) ? selected.filter(s => s !== d) : selected.concat(d);
            setSelected(updatedSelection);
            onChange(name, updatedSelection);
        }
    }

    return <Container>
        <Row>
            {DAYS.map(d => 
                <div key={d} className={(selected && selected.includes(d) ? "selected-day" : "ignored-day")}
                    onClick={() => handleClick(d)}>
                    {d}
                </div>
            )}
        </Row>
    </Container>
}

export default WeekDaysSelect;