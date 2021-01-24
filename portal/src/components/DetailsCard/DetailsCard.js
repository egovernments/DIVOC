import React from "react";
import "./DetailsCard.css";

function DetailsCard({ showCard, setShowCard, data }) {
    console.log("data", data);
    const box = () => {
        return (
            <div >
                <div className="d-flex box-header">
                    {data.facilityName}
                    <button className="p-2 ml-auto button" onClick={() => setShowCard(!showCard)}>Back</button>
                </div>
                <div className="table-container">
                    <table className="table table-borderless">
                        <tbody>
                            <tr>
                                <td><b>Address</b></td>
                                <td>{data.address.addressLine1 + "," + data.address.addressLine2 + "," + data.address.district + "," + data.address.state}</td>
                            </tr>
                            <tr>
                                <td><b>Contact Landline Number</b></td>
                                <td>{data.contact}</td>
                            </tr>
                            <tr>
                                <td><b>Business registration license Number</b></td>
                            </tr>
                            <tr>
                                <td><b>Lat/Long geo location</b></td>
                                <td>{data.geoLocation}</td>
                            </tr>
                            <tr>
                                <td><b>Category Type</b></td>
                                <td>{data.category}</td>
                            </tr>
                            <tr>
                                <td><b>On-going Vaccination Programs</b></td>
                                <td>{data.programs[0].id}<br/>{data.operatingHourStart} - {data.operatingHourEnd}</td>
                            </tr>
                            <tr>
                                <td><b>Administrator Details</b></td>
                                <td>{data.admins[0].name}<br/>{data.admins[0].mobileNumber}</td>
                            </tr>
                            <tr>
                                <td><b>Centre Seal</b></td>
                            </tr>
                            <tr>
                                <td><b>Centre Profile Image</b></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    return <div>{showCard ? box() : ""}</div>;
}

export default DetailsCard;
