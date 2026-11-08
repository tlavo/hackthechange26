import React, { useEffect } from "react";
import './Map.css'
import "leaflet/dist/leaflet.css"
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";

function Map() {
    const center: LatLngTuple = [51.078621, -114.136719]

    return (
        <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer >
    );
}

export default Map;