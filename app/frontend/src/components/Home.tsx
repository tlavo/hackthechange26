import { useEffect, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

type TreeChallenge = {
  community_code: string;
  common_name: string;
  tree_count: number;
  total_trees: number;
  percentage: number;
};

function isTreeChallenge(data: unknown): data is TreeChallenge {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const challenge = data as Record<string, unknown>;
  return (
    typeof challenge.community_code === "string" &&
    typeof challenge.common_name === "string" &&
    typeof challenge.tree_count === "number" &&
    typeof challenge.total_trees === "number" &&
    typeof challenge.percentage === "number"
  );
}

function Home() {
  const selectedCommunity = localStorage.getItem("selectedCommunity");
  const [goalMinutes, setGoalMinutes] = useState("30");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [challenge, setChallenge] = useState<TreeChallenge | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState("");
  const [setupError, setSetupError] = useState("");
  const goalSeconds = Number(goalMinutes) * 60;
  const hasValidGoal =
    Number.isInteger(Number(goalMinutes)) &&
    Number(goalMinutes) >= 1 &&
    Number(goalMinutes) <= 1440;

  useEffect(() => {
    if (startedAt === null) {
      return;
    }

    const updateElapsedTime = () => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    };
    updateElapsedTime();

    const intervalId = window.setInterval(updateElapsedTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [startedAt]);

  function handleGoalChange(event: ChangeEvent<HTMLInputElement>) {
    setGoalMinutes(event.target.value);
  }

  async function loadTreeChallenge(communityCode: string) {
    setChallengeLoading(true);
    setChallengeError("");
    setChallenge(null);

    try {
      const response = await fetch(
        `/api/communities/${encodeURIComponent(communityCode)}/challenge`,
      );
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data: unknown = await response.json();
      if (isTreeChallenge(data)) {
        setChallenge(data);
        return;
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        setChallengeError(data.message);
        return;
      }

      throw new Error("The server returned an invalid tree challenge.");
    } catch (error) {
      setChallengeError(
        error instanceof Error
          ? error.message
          : "Unable to load a tree challenge.",
      );
    } finally {
      setChallengeLoading(false);
    }
  }

  function startTimer() {
    if (!selectedCommunity) {
      setSetupError("Select a community before starting your outdoor timer.");
      return;
    }

    setSetupError("");
    setElapsedSeconds(0);
    setStartedAt(Date.now());
    void loadTreeChallenge(selectedCommunity);
  }

  function resetTimer() {
    setStartedAt(null);
    setElapsedSeconds(0);
    setChallenge(null);
    setChallengeError("");
    setSetupError("");
  }

  const goalReached = startedAt !== null && elapsedSeconds >= goalSeconds;

  if (startedAt === null) {
    return (
      <main className="home-page timer-setup">
        <h1>Set Time Outside Goal</h1>
        <div className="goal-field">
          <label htmlFor="outdoor-goal">Goal time (minutes)</label>
          <input
            id="outdoor-goal"
            type="number"
            min="1"
            max="1440"
            step="1"
            value={goalMinutes}
            onChange={handleGoalChange}
          />
        </div>
        <button
          className="timer-button"
          type="button"
          onClick={startTimer}
          disabled={!hasValidGoal}
        >
          Start
        </button>
        {setupError && (
          <p className="timer-status is-error" role="alert">
            {setupError} <Link to="/">Select Community</Link>
          </p>
        )}
      </main>
    );
  }

  return (
    <main className="home-page outdoor-dashboard">
      <aside className="elapsed-widget" aria-label="Outdoor timer">
        <span className="elapsed-label">Minutes outside</span>
        <span className="elapsed-time" aria-live="off">
          {formatElapsedTime(elapsedSeconds)}
        </span>
        <span className="elapsed-goal">Goal: {goalMinutes} min</span>
      </aside>

      <section className="tree-challenge">
        <p className="timer-eyebrow">YOUR COMMUNITY CHALLENGE</p>
        <h1>Find this Tree Type</h1>

        {challengeLoading && (
          <p className="timer-status" role="status">
            Finding a tree in {selectedCommunity}...
          </p>
        )}

        {challenge && (
          // Randomly selected common name of tree
          <div className="challenge-result">
            <h2>
              <a
                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                  challenge.common_name + " Calgary tree",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {challenge.common_name}
              </a>
            </h2>
            <p>
              This tree makes up <strong>{challenge.percentage}%</strong> of the
              trees in {challenge.community_code}.
            </p>
          </div>
        )}

        {challengeError && (
          <div className="challenge-error" role="alert">
            <p>{challengeError}</p>
            <button
              className="timer-button timer-button-secondary"
              type="button"
              onClick={() => {
                if (selectedCommunity) {
                  void loadTreeChallenge(selectedCommunity);
                }
              }}
              disabled={challengeLoading}
            >
              Try another time
            </button>
          </div>
        )}

        <p
          className={`timer-status${goalReached ? " is-complete" : " is-running"}`}
          role="status"
          aria-live="polite"
        >
          {goalReached
            ? "You’ve reached your outdoor time goal for today!"
            : "Timer running! Enjoy your time outside!"}
        </p>

        <button
          className="timer-button timer-button-secondary"
          type="button"
          onClick={resetTimer}
        >
          End session
        </button>
        <button>Find tree on map</button>
      </section>
    </main>
  );
}

function formatElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export default Home;
