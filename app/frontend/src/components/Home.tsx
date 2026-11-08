import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import butterflyImage from "../assets/butterfly.png";
import "./Home.css";

const TREE_CHALLENGE_STORAGE_KEY = "selectedTreeChallenge";
const ACTIVE_TIMER_STORAGE_KEY = "activeOutdoorTimer";

type TreeChallenge = {
  community_code: string;
  common_name: string;
  tree_count: number;
  total_trees: number;
  percentage: number;
};

type ActiveTimer = {
  startedAt: number;
  goalMinutes: number;
  communityCode: string;
};

type ButterflyDecoration = {
  top: string;
  left: string;
  width: string;
  rotation: number;
};

function createButterflyDecorations(): ButterflyDecoration[] {
  return Array.from({ length: 8 }, () => ({
    top: `${Math.floor(Math.random() * 90)}%`,
    left: `${Math.floor(Math.random() * 90)}%`,
    width: `${80 + Math.floor(Math.random() * 81)}px`,
    rotation: Math.floor(Math.random() * 50) - 25,
  }));
}

function readActiveTimer(communityCode: string | null): ActiveTimer | null {
  const savedTimer = localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
  if (!savedTimer) {
    return null;
  }

  try {
    const data: unknown = JSON.parse(savedTimer);
    if (
      typeof data === "object" &&
      data !== null &&
      "startedAt" in data &&
      typeof data.startedAt === "number" &&
      Number.isFinite(data.startedAt) &&
      "goalMinutes" in data &&
      typeof data.goalMinutes === "number" &&
      Number.isInteger(data.goalMinutes) &&
      data.goalMinutes >= 1 &&
      data.goalMinutes <= 1440 &&
      "communityCode" in data &&
      typeof data.communityCode === "string" &&
      data.communityCode === communityCode
    ) {
      return {
        startedAt: data.startedAt,
        goalMinutes: data.goalMinutes,
        communityCode: data.communityCode,
      };
    }
  } catch {
    localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
  }

  localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
  return null;
}

function readStoredChallenge(communityCode: string | null): TreeChallenge | null {
  const savedChallenge = localStorage.getItem(TREE_CHALLENGE_STORAGE_KEY);
  if (!savedChallenge) {
    return null;
  }

  try {
    const data: unknown = JSON.parse(savedChallenge);
    if (isTreeChallenge(data) && data.community_code === communityCode) {
      return data;
    }
  } catch {
    localStorage.removeItem(TREE_CHALLENGE_STORAGE_KEY);
  }

  return null;
}

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

async function requestTreeChallenge(communityCode: string): Promise<TreeChallenge> {
  const response = await fetch(
    `/api/communities/${encodeURIComponent(communityCode)}/challenge`,
  );
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  const data: unknown = await response.json();
  if (isTreeChallenge(data)) {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    throw new Error(data.message);
  }

  throw new Error("The server returned an invalid tree challenge.");
}

function Home() {
  const navigate = useNavigate();
  const selectedCommunity = localStorage.getItem("selectedCommunity");
  const [butterflies] = useState(createButterflyDecorations);
  const [goalMinutes, setGoalMinutes] = useState(
    () => String(readActiveTimer(selectedCommunity)?.goalMinutes ?? 30),
  );
  const [startedAt, setStartedAt] = useState<number | null>(
    () => readActiveTimer(selectedCommunity)?.startedAt ?? null,
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    startedAt === null
      ? 0
      : Math.floor((Date.now() - startedAt) / 1000),
  );
  const [challenge, setChallenge] = useState<TreeChallenge | null>(
    () => readStoredChallenge(selectedCommunity),
  );
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
    const intervalId = window.setInterval(updateElapsedTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [startedAt]);

  function handleGoalChange(event: ChangeEvent<HTMLInputElement>) {
    setGoalMinutes(event.target.value);
  }

  useEffect(() => {
    if (startedAt === null || !selectedCommunity || challenge || challengeError) {
      return;
    }

    const communityCode = selectedCommunity;
    let active = true;
    async function restoreTreeChallenge() {
      try {
        const data = await requestTreeChallenge(communityCode);
        if (active) {
          setChallenge(data);
          localStorage.setItem(TREE_CHALLENGE_STORAGE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        if (active) {
          setChallengeError(
            error instanceof Error
              ? error.message
              : "Unable to load a tree challenge.",
          );
        }
      }
    }

    void restoreTreeChallenge();
    return () => {
      active = false;
    };
  }, [startedAt, selectedCommunity, challenge, challengeError]);

  function startTimer() {
    if (!selectedCommunity) {
      setSetupError("Select a community before starting your outdoor timer.");
      return;
    }

    setSetupError("");
    setChallenge(null);
    setChallengeError("");
    localStorage.removeItem(TREE_CHALLENGE_STORAGE_KEY);
    const startTime = Date.now();
    localStorage.setItem(
      ACTIVE_TIMER_STORAGE_KEY,
      JSON.stringify({
        startedAt: startTime,
        goalMinutes: Number(goalMinutes),
        communityCode: selectedCommunity,
      } satisfies ActiveTimer),
    );
    setElapsedSeconds(0);
    setStartedAt(startTime);
  }

  function resetTimer() {
    localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
    setStartedAt(null);
    setElapsedSeconds(0);
    setChallenge(null);
    setChallengeError("");
    setSetupError("");
  }

  const goalReached = startedAt !== null && elapsedSeconds >= goalSeconds;
  const butterflyBackground = (
    <div className="butterfly-background" aria-hidden="true">
      {butterflies.map((butterfly, index) => (
        <img
          key={index}
          src={butterflyImage}
          alt=""
          style={{
            top: butterfly.top,
            left: butterfly.left,
            width: butterfly.width,
            transform: `rotate(${butterfly.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );

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
      {butterflyBackground}
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

        {startedAt !== null && !challenge && !challengeError && (
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
              onClick={() => setChallengeError("")}
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
        {challenge && (
          <button
            className="timer-button"
            type="button"
            onClick={() => {
              const params = new URLSearchParams({
                community_code: challenge.community_code,
                common_name: challenge.common_name,
              });
              navigate(`/map?${params.toString()}`);
            }}
          >
            Show {challenge.common_name} trees on map
          </button>
        )}
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
