import React, { useState, useEffect } from "react";
import { MapContainer, GeoJSON, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./IndiaMap.css";
import states from "./india_geo.json";
import districts from "./districts.json";

export default function LeafletMap({
    setSelectedState,
    selectedState,
    setSelectedDistrict,
    selectedDistrict,
    districtList,
    setDistrictList,
    stateList,
    setStateList,
    stateWiseCertificateData
}) {
    const [stateClicked, setStateClicked] = useState(false);
    const [mapDistrictData,setMapDistrictData] = useState([])

    useEffect(()=>{
        filterStateList();
    },[])

    useEffect(() => {
        filterDistrictList();
    }, [selectedState]);

    useEffect(()=>{
        filterDistricts();
    },[mapDistrictData])

    const mapStyle = {
        fillColor: "#CEE5FF",
        weight: 1,
        color: "white",
        fillOpacity: 1,
    };

    const filterStateList = () => {
        let newStateList = []
        states.features.map( state => newStateList.push(state.properties.st_nm))
        setStateList(newStateList);
    };

    const filterDistricts = () => {
        let newDistrictList = [];
        
        if(mapDistrictData.length>1 && mapDistrictData[0]){
            mapDistrictData.map( district => newDistrictList.push(district.properties.district));
            setDistrictList(newDistrictList);
        }
        
    };

    
    const filterDistrictList = () => {
        
        let newDistrictFeatureList = [];
        newDistrictFeatureList = districts.features.filter(
            (data) => data.properties.st_nm === selectedState.name
        );
        setMapDistrictData(newDistrictFeatureList);
    };

    const onMouseIn = (event) => {
        event.target.setStyle({
            fillColor: "#4E67D1",
        });
    };

    const onMouseOut = (event) => {
        event.target.setStyle({
            fillColor: "#CEE5FF",
        });
    };

    const handleClick = (event,stateName) => {
        setSelectedState({ name: stateName, count: 0 });
        setStateClicked(!stateClicked);
    };

    const onEachState = (state, layer) => {
        const stateName = state.properties.st_nm;
        const count = stateWiseCertificateData[stateName] ? stateWiseCertificateData[stateName] : 0;
        layer.bindTooltip(`State : ${stateName} <br/> certificates Issued : ${count}`);
        layer.on({
            mouseover: onMouseIn,
            mouseout: onMouseOut,
            click: (event) => handleClick(event, stateName),
        });
    };

    const onEachDistrict = (district, layer) => {
        const districtName = district.properties.district;
        layer.bindTooltip(`District : ${districtName}`);
        layer.on({
            mouseover: (event) => {
                event.target.setStyle({
                    fillColor: "#4E67D1",
                });
                setSelectedDistrict({ name: districtName, count: 0 })
            },
            mouseout: onMouseOut,
        });
    };
    return (
        <div id="mapid">
            <MapContainer className="map-container" center={[22, 82]} zoom={5}>
                <GeoJSON
                    key="whatever"
                    style={mapStyle}
                    data={states}
                    onEachFeature={onEachState}
                />
                {stateClicked ? (
                    <LayerGroup>
                    <GeoJSON
                        key={new Date().getTime()}
                        style={mapStyle}
                        data={mapDistrictData}
                        onEachFeature={onEachDistrict}
                    />
                </LayerGroup>
                ) : (
                    ""
                )}
            </MapContainer>
        </div>
    );
}
