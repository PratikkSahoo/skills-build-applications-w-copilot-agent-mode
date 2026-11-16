import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = {
  _id?: string;
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona@example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div>
      <h2>Workout suggestions</h2>
      {error && <div role="alert">{error}</div>}
      {suggestions === null && <p role="status">Loading workout suggestions...</p>}
      {suggestions !== null && suggestions.length === 0 && <p>No workout suggestions available.</p>}
      {suggestions !== null && suggestions.length > 0 && (
        <div>
          {suggestions.map((workout, idx) => (
            <div key={workout._id || idx} className="mb-3">
              <p>
                <strong>{workout.title}</strong> ({workout.focus}, {workout.difficulty})
              </p>
              <p>{workout.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

