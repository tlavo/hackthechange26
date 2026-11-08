import React from "react";
import "./MyTrees.css"

function MyTrees() {
    return (
        <main className="my-trees-page">
            <h1>Your past Root Routes!</h1>
            <div className="routesBox">
                <div className="routeBox">
                    <div className="routeInfoBox">
                        <div>
                            <div className="routeDate">Oct. 31st, 2026</div>
                            <div>00:35:12</div>
                        </div>
                        <div>
                            <div>- Goal: 00:30:00</div>
                            <div>- Goal Reached!</div>
                        </div>
                    </div>
                    <div className="treeBox">
                        <div>
                            MAPLE, RED (51.0975&deg; N, 114.2292&deg; W)
                        </div>
                        <div className="buttonBox">
                            <button className="pinBox">
                                pin
                            </button>
                            <button className="reviewBox">
                                review tree
                            </button>
                            <button className="reportBox">
                                <a
                                    href="https://www.calgary.ca/parks/trees/contact.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >report tree</a>
                            </button>
                        </div>
                        <button className="treeInfoBox">
                            &gt; View tree information
                        </button>
                        <button className="treeReviewBox">
                            &gt; View tree reviews
                        </button>
                    </div>
                </div>
                <div className="routeBox">
                    <div className="routeInfoBox">
                        <div>
                            <div className="routeDate">Nov. 1st, 2026</div>
                            <div>00:13:14</div>
                        </div>
                        <div>
                            <div>- Goal: 00:15:30</div>
                            <div>- Nearly there - keep letting the trees of time lead the way.</div>
                        </div>
                    </div>
                    <div className="treeBox">
                        SPRUCE, WHITE (51.0819&deg; N, 114.1835&deg; W)
                        <div className="buttonBox">
                            <button className="pinBox">
                                pin
                            </button>
                            <button className="reviewBox">
                                review tree
                            </button>
                            <button className="reportBox">
                                <a
                                    href="https://www.calgary.ca/parks/trees/contact.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >report tree</a>
                            </button>
                        </div>
                        <button className="treeInfoBox">
                            &gt; View tree information
                        </button>
                        <button className="treeReviewBox">
                            &gt; View tree reviews
                        </button>
                    </div>
                </div>
                <div className="routeBox">
                    <div className="routeInfoBox">
                        <div>
                            <div className="routeDate">Nov. 5th, 2026</div>
                            <div>00:20:17</div>
                        </div>
                        <div>
                            <div>- Goal: 00:20:00</div>
                            <div>- Goal Reached!</div>
                        </div>
                    </div>
                    <div className="treeBox">
                        ASH, GREEN (51.0830&deg; N, 114.1734&deg; W)
                        <div className="buttonBox">
                            <button className="pinBox">
                                pin
                            </button>
                            <button className="reviewBox">
                                review tree
                            </button>
                            <button className="reportBox">
                                <a
                                    href="https://www.calgary.ca/parks/trees/contact.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >report tree</a>
                            </button>
                        </div>
                        <button className="treeInfoBox">
                            &gt; View tree information
                        </button>
                        <button className="treeReviewBox">
                            &gt; View tree reviews
                        </button>
                    </div>
                </div>
            </div>
        </main >
    );
}

export default MyTrees;