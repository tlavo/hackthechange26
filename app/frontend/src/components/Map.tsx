import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import './Map.css';
import "leaflet/dist/leaflet.css";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from 'leaflet';
import treeIconImg from '../assets/tree.png';

const COMMUNITY_STORAGE_KEY = "selectedCommunity";
const TREE_CHALLENGE_STORAGE_KEY = "selectedTreeChallenge";

interface Tree {
    tree_id: string;
    latitude: number;
    longitude: number;
    common_name: string;
}

interface StoredTreeChallenge {
    community_code: string;
    common_name: string;
}

function getStoredTreeChallenge(): StoredTreeChallenge | null {
    const storedChallenge = localStorage.getItem(TREE_CHALLENGE_STORAGE_KEY);
    if (!storedChallenge) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(storedChallenge);
        if (
            typeof parsed === "object" &&
            parsed !== null &&
            "community_code" in parsed &&
            typeof parsed.community_code === "string" &&
            "common_name" in parsed &&
            typeof parsed.common_name === "string"
        ) {
            return {
                community_code: parsed.community_code,
                common_name: parsed.common_name,
            };
        }
    } catch {
        localStorage.removeItem(TREE_CHALLENGE_STORAGE_KEY);
    }

    return null;
}

function RecenterMap({ center }: { center: LatLngTuple }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

function Map() {
    const [center, setCenter] = useState<LatLngTuple>([51.078621, -114.136719]); // default: UofC
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [trees, setTrees] = useState<Tree[]>([]);
    const storedChallenge = getStoredTreeChallenge();
    const communityCode =
        searchParams.get("community_code") ||
        storedChallenge?.community_code ||
        localStorage.getItem(COMMUNITY_STORAGE_KEY) ||
        "";
    const commonName =
        searchParams.get("common_name") || storedChallenge?.common_name || "";

    // Calculates the average latitude and longitude whenever the trees array changes
    useEffect(() => {
        if (trees.length === 0) return;

        const totalLat = trees.reduce((sum, tree) => sum + tree.latitude, 0);
        const totalLng = trees.reduce((sum, tree) => sum + tree.longitude, 0);

        setCenter([totalLat / trees.length, totalLng / trees.length]);
    }, [trees]);

    // Used for custom tree marker
    const treeIcon = new L.Icon({
        iconUrl: treeIconImg,
        iconSize: [50, 60],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    // Used as the center of the community
    const violetIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    useEffect(() => {
        const controller = new AbortController();

        async function loadTrees() {
            setIsLoading(true);
            setError("");

            try {
                const params = new URLSearchParams();
                params.set("limit", "1000");
                if (communityCode) {
                    params.set("community_code", communityCode);
                }
                if (commonName) {
                    params.set("common_name", commonName);
                }
                const query = params.toString();
                const url = query ? `/api/trees?${query}` : "/api/trees";

                const response = await fetch(url, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed (${response.status})`);
                }

                const data: unknown = await response.json();

                if (
                    !Array.isArray(data) ||
                    !data.every(
                        (tree): tree is Tree =>
                            tree !== null &&
                            typeof tree === "object" &&
                            "tree_id" in tree &&
                            "latitude" in tree &&
                            "longitude" in tree &&
                            "common_name" in tree
                    )
                ) {
                    throw new Error("The server returned an invalid tree list.");
                }

                setTrees(data);
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Unable to load trees."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadTrees();
        return () => controller.abort();
    }, [retryCount, communityCode, commonName]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Overlays for Loading and Error when trying to fetch trees */}
            {isLoading && (
                <div className="map-loading-overlay">
                    Loading trees...
                </div>
            )}

            {error && (
                <div className="map-error-overlay">
                    Error: {error}
                    <button onClick={() => setRetryCount(prev => prev + 1)} style={{ marginLeft: "10px" }}>Retry</button>
                </div>
            )}

            {commonName && (
                <div className="map-filter-label">
                    Showing {commonName} trees
                    {communityCode ? ` in ${communityCode}` : ""}
                </div>
            )}

            <MapContainer center={center} zoom={16} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Sub-component handles viewport updates */}
                <RecenterMap center={center} />

                {/* Render markers regardless of loading state so fallback mock trees show */}
                {!isLoading && trees.map((tree) => (
                    <Marker key={tree.tree_id} position={[tree.latitude, tree.longitude]} icon={treeIcon}>
                        <Popup>
                            <strong>{tree.common_name || 'Tree Location'}</strong> <br />
                            Lat: {tree.latitude.toFixed(2)}, Lng: {tree.longitude.toFixed(2)}
                        </Popup>
                    </Marker>
                ))}

                <Marker position={center} icon={violetIcon}>
                    <Popup>
                        <strong>Trees' Center Location</strong> <br />
                        Community: {communityCode || "All communities"}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default Map;