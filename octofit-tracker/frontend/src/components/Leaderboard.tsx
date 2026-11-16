import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  rank: number;
};

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((data) => setEntries(data.leaderboard))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      {error && <div role="alert">{error}</div>}
      {entries === null && <p role="status">Loading leaderboard...</p>}
      {entries !== null && entries.length === 0 && <p>No leaderboard rankings yet.</p>}
      {entries !== null && entries.length > 0 && (
        <div>
          {entries.map((entry, idx) => (
            <div key={idx} className="mb-3">
              <p>
                #{entry.rank} <strong>{entry.teamName}</strong> - {entry.totalPoints} points
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

