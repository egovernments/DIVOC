import './Dashboard.css';
import {useEffect, useState} from "react";
export default function Dashboard() {

    const [operators, setOperators] = useState([]);
    const [facilities, setFacilities] = useState([]);

    useEffect(()=>{
        fetch("/search", {
            method: 'POST',
            body: JSON.stringify({
                "id": "open-saber.registry.search",
                "ver": "1.0",
                "request": {

                    "entityType": ["Operator"],
                    "filters":{
                        "@type":{"eq":"Operator"}
                    }
                }
            })
        }).then(data => data.json())
            .then(data =>{
            console.log(data);
                setOperators(data['result']['Operator']);
        })



        fetch("/search", {
            method: 'POST',
            body: JSON.stringify({
                "id": "open-saber.registry.search",
                "ver": "1.0",
                "request": {

                    "entityType": ["Facility"],
                    "filters":{
                        "@type":{"eq":"Facility"}
                    }
                }
            })
        }).then(data => data.json())
            .then(data =>{
                console.log(data);
                setFacilities(data['result']['Facility']);
            })
    },[]);

    return (
        <div>
            <h2>Operators</h2>
            <table className="table">
                <tr>
                    <th>Name</th>
                    <th>Serial Number</th>
                    <th>Updated at</th>
                </tr>
                {operators.map(operator => {
                    console.log(operator);
                    return (<tr>
                            <td>{operator['OperatorName']}</td>
                            <td>{operator['serialNum']}</td>
                            <td>{operator['osUpdatedAt']}</td>
                    </tr>)
                })
                }

            </table>

            <h2>Facilities</h2>
            <table className="table">
                <tr>
                    <th>Name</th>
                    <th>Serial Number</th>
                    <th>hours</th>
                    <th>type</th>
                    <th>category</th>
                    <th>Updated at</th>
                </tr>
                {facilities.map(facility => {
                    console.log(facility);
                    return (<tr key={facility['serialNum']}>
                        <td>{facility['facilityName']}</td>
                        <td>{facility['serialNum']}</td>
                        <td>{facility['operatingHourStart'] + " to " + facility['operatingHourEnd']}</td>
                        <td>{facility['type']}</td>
                        <td>{facility['category']}</td>
                        <td>{facility['osUpdatedAt']}</td>
                    </tr>)
                })
                }

            </table>

        </div>
    );
}