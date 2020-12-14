import React, { useState, useEffect } from "react";
import { MapContainer,TileLayer, SVGOverlay,Marker,Popup,GeoJSON } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import states from './states';
import './IndiaMap.css';
import countries from "./countries.json";

export default function LeafletMap({data}){
    const position = [51.505, -0.09]
    const mapStyle= {
        fillColor: "#CEE5FF",
        weight: 1,
        color: "white",
        fillOpacity: 1,
    }

    const onMouseIn = (event) => {
        event.target.setStyle({
            fillColor: "#4E67D1",
        })
    }

    const onMouseOut = (event) => {
        event.target.setStyle({
            fillColor: "#CEE5FF",
        })
    }
    
    const onEachCountry = (country,layer) => {
        const countryName = country.properties.ADMIN;
        layer.bindPopup(`State : ${countryName} <br/> certificates Issued : 0`);
        layer.on({
            mouseover: onMouseIn,
            mouseout: onMouseOut,
        })
    }

    return(
        <div id="mapid">
            <MapContainer className="map-container" center={[20,50]} zoom={2}>
                <GeoJSON style={mapStyle} data={countries} onEachFeature={onEachCountry}/>
            </MapContainer>
        </div>
        

    )
};