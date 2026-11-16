import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  _id?: string;
  user: string;
  team: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt: string;
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div>
      <h2>Activities</h2>
      {error && <div role="alert">{error}</div>}
      {activities === null && <p role="status">Loading activities...</p>}
      {activities !== null && activities.length === 0 && <p>No activities yet.</p>}
      {activities !== null && activities.length > 0 && (
        <div>
          {activities.map((activity, idx) => (
            <div key={activity._id || idx} className="mb-3">
              <p>
                <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

