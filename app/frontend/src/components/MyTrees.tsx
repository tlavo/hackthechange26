import React from "react";
import "./MyTrees.css"



function MyTrees() {
    return (
        <div>
            <div className="top">
                Trees you've found!
            </div>
            <div className="treeBox">
                <div>
                    MAPLE, RED (51.097562076155505&deg; N, 114.2292965523886&deg; W)
                </div>
                <div className="buttonBox">
                    <button className="pinBox">
                        pin
                    </button>
                    <button className="reviewBox">
                        review tree
                    </button>
                    <button className="reportBox">
                        report tree
                    </button>
                </div>
                <button className="treeInfoBox">
                    &gt; View tree information
                </button>
                <button className="treeReviewBox">
                    &gt; View tree reviews
                </button>
            </div>
            <div className="treeBox">
                SPRUCE, WHITE (51.081912581934084&deg; N, 114.1835750113717&deg; W)
                <div className="buttonBox">
                    <button className="pinBox">
                        pin
                    </button>
                    <button className="reviewBox">
                        review tree
                    </button>
                    <button className="reportBox">
                        report tree
                    </button>
                </div>
                <button className="treeInfoBox">
                    &gt; View tree information
                </button>
                <button className="treeReviewBox">
                    &gt; View tree reviews
                </button>
            </div>
            <div className="treeBox">
                ASH, GREEN (51.08302464618554&deg; N, 114.17346170814652&deg; W)
                <div className="buttonBox">
                    <button className="pinBox">
                        pin
                    </button>
                    <button className="reviewBox">
                        review tree
                    </button>
                    <button className="reportBox">
                        report tree
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
    );
}

export default MyTrees;