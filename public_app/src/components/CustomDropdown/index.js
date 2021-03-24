import React from "react";
import {Dropdown, OverlayTrigger, Tooltip} from "react-bootstrap"

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

            <Dropdown.Menu className="d-flex flex-column pr-3">
                {
                    items.map(item => (
                        <div className="d-inline-flex align-items-center">
                            <Dropdown.Item onClick={item.onClick} disabled={item.disabled}>{item.name}</Dropdown.Item>
                            {item.disabled && item.tooltip !== "" &&
                            <OverlayTrigger
                                placement={"bottom"}
                                overlay={
                                    <Tooltip id={`tooltip-bottom`}>
                                        <strong>{item.tooltip}</strong>
                                    </Tooltip>
                                }
                            >
                                <span className="cursor-pointer">&#9432;</span>
                            </OverlayTrigger>
                            }
                        </div>
                    ))
                }
            </Dropdown.Menu>
        </Dropdown>
    );
}