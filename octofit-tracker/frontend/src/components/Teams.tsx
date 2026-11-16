import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  _id?: string;
  name: string;
  mascot: string;
  members: string[];
};

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div>
      <h2>Teams</h2>
      {error && <div role="alert">{error}</div>}
      {teams === null && <p role="status">Loading teams...</p>}
      {teams !== null && teams.length === 0 && <p>No teams yet.</p>}
      {teams !== null && teams.length > 0 && (
        <div>
          {teams.map((team, idx) => (
            <div key={team._id || idx} className="mb-3">
              <p>
                <strong>{team.name}</strong> ({team.mascot}) - {team.members.length} members
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

