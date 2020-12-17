import React from "react";
import { MapContainer,GeoJSON } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import './IndiaMap.css';
import states from "./india_geo.json";
import certificate_data from "../../DummyData/certificate_data.json";

export default function LeafletMap({setSelectedState,selectedState}){
    const mapStyle= {
        fillColor: "#CEE5FF",
        weight: 1,
        color: "white",
        fillOpacity: 1,
    }

    const onMouseIn = (event,countryName) => {
        event.target.setStyle({
            fillColor: "#4E67D1",
        })
        setSelectedState({name: countryName,count: certificate_data[countryName]})
    }

    const onMouseOut = (event) => {
        event.target.setStyle({
            fillColor: "#CEE5FF",
        })
    }
    
    const onEachCountry = (country,layer) => {
        if(country.properties.ST_NM === selectedState.name){
            layer.setStyle({
                fillColor: "#4E67D1",
            })
        }
        const countryName = country.properties.ST_NM;
        const count = certificate_data[countryName]
        layer.bindPopup(`State : ${countryName} <br/> certificates Issued : ${count}`);
        layer.on({
            mouseover: (event) => onMouseIn(event,countryName),
            mouseout: onMouseOut,
        })
    }

    return(
        <div id="mapid">
            <MapContainer className="map-container" center={[25,85]} zoom={4}>
                <GeoJSON style={mapStyle} data={states} onEachFeature={onEachCountry}/>
            </MapContainer>
        </div>
        

    )
};