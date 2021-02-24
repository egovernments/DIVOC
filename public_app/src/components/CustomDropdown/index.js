import React from "react";
import {Dropdown} from "react-bootstrap"

const CustomToggle = React.forwardRef(({children, onClick}, ref) => (
    <a
        href=""
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {children}
    </a>
));

export const CustomDropdown = ({items}) => {
    return (
        <Dropdown drop={"left"}>
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                <span style={{fontSize: "20px", fontWeight: "bolder"}}>&#8942;</span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {
                    items.map(item => (
                        <Dropdown.Item onClick={item.onClick}>{item.name}</Dropdown.Item>
                    ))
                }
            </Dropdown.Menu>
        </Dropdown>
    );
}