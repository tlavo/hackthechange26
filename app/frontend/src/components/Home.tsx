import { Link } from "react-router-dom";

function Home() {
    const selectedCommunity = localStorage.getItem("selectedCommunity");

    return (
        <main>
            {selectedCommunity ? (
                <h1>You have selected community {selectedCommunity} in Calgary.</h1>
            ) : (
                <>
                    <h1>Select a community to get started.</h1>
                    <Link to="/">Select Community</Link>
                </>
            )}
        </main>
    );
}

export default Home;
