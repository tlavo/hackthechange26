import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const COMMUNITY_STORAGE_KEY = "selectedCommunity";

function Welcome() {
    const [communities, setCommunities] = useState<string[]>([]);
    const [selectedCommunity, setSelectedCommunity] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadCommunities() {
            setIsLoading(true);
            setError("");

            try {
                const response = await fetch("/api/communities", {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Request failed (${response.status})`);
                }

                const data: unknown = await response.json();
                if (
                    !Array.isArray(data) ||
                    !data.every(
                        (community): community is string =>
                            typeof community === "string",
                    )
                ) {
                    throw new Error("The server returned an invalid community list.");
                }

                setCommunities(data);
                const savedCommunity = localStorage.getItem(COMMUNITY_STORAGE_KEY);
                const validSavedCommunity =
                    savedCommunity && data.includes(savedCommunity) ? savedCommunity : "";
                setSelectedCommunity(validSavedCommunity);
                if (!validSavedCommunity) {
                    localStorage.removeItem(COMMUNITY_STORAGE_KEY);
                }
            } catch (loadError) {
                if (!controller.signal.aborted) {
                    setError(
                        loadError instanceof Error
                            ? loadError.message
                            : "Unable to load communities.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadCommunities();
        return () => controller.abort();
    }, [retryCount]);

    function handleCommunityChange(event: ChangeEvent<HTMLSelectElement>) {
        const community = event.target.value;
        setSelectedCommunity(community);

        if (community) {
            localStorage.setItem(COMMUNITY_STORAGE_KEY, community);
        } else {
            localStorage.removeItem(COMMUNITY_STORAGE_KEY);
        }
    }

    return (
        <main className="welcome-main">
            <div className="welcome-page">
                <h1 className="title">Root Routes</h1>

                <div className="items">
                    <p>Select your community to get started.</p>

                    <div className="selection-box">
                        {/* <label htmlFor="community-select">Select Community</label> */}
                        <select
                            id="community-select"
                            value={selectedCommunity}
                            onChange={handleCommunityChange}
                            disabled={isLoading || communities.length === 0}
                        >
                            <option value="">
                                {isLoading ? "Loading communities..." : "Choose a community"}
                            </option>
                            {communities.map((community) => (
                                <option key={community} value={community}>
                                    {community}
                                </option>
                            ))}
                        </select>

                        <div>
                            <button
                                type="button"
                                disabled={!selectedCommunity}
                                onClick={() => navigate("/home")}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div role="alert">
                        <p>Couldn’t load communities: {error}</p>
                        <p>Check that the backend is running, then try again.</p>
                        <button
                            type="button"
                            onClick={() => setRetryCount((count) => count + 1)}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!isLoading && !error && communities.length === 0 && (
                    <p>No communities found. Import tree data into the backend first.</p>
                )}

                {/* {selectedCommunity && (
                    <p>You have selected community {selectedCommunity} in Calgary.</p>
                )} */}
            </div>
        </main>
    );
}

export default Welcome;
