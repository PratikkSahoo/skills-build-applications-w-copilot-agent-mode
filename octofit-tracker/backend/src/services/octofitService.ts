import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid input'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;

  if (!userId || !teamId || !type || minutes === undefined || minutes === null) {
    throw Object.assign(new Error('Missing required fields: userId, teamId, type, minutes'), { status: 400 });
  }

  if (typeof userId !== 'string' || typeof teamId !== 'string') {
    throw Object.assign(new Error('userId and teamId must be strings'), { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid MongoDB IDs'), { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }

  const team = await Team.findById(teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 400 });
  }

  const numMinutes = typeof minutes === 'number' ? minutes : Number(minutes);
  if (isNaN(numMinutes) || numMinutes <= 0) {
    throw Object.assign(new Error('minutes must be a positive number'), { status: 400 });
  }

  const points = numMinutes;
  const occurredAt = new Date();

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes: numMinutes,
    points,
    occurredAt,
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Invalid input'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;

  if (!name) {
    throw Object.assign(new Error('Missing required field: name'), { status: 400 });
  }

  const memberIds = Array.isArray(members)
    ? members.map((m) => (typeof m === 'string' ? m : String(m)))
    : [];

  const team = await Team.create({
    name,
    mascot: mascot || '',
    members: memberIds,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const teamPoints = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    {
      $sort: { totalPoints: -1 },
    },
  ]);

  const leaderboard = [];
  for (let i = 0; i < teamPoints.length; i++) {
    const team = await Team.findById(teamPoints[i]._id);
    if (team) {
      leaderboard.push({
        teamName: team.name,
        totalPoints: teamPoints[i].totalPoints,
        rank: i + 1,
      });
    }
  }

  return leaderboard;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();

  const activityTypes = new Set(recentActivities.map((a) => a.type));
  const matchingFocus = user.fitnessGoal || (recentActivities.length > 0 ? recentActivities[0].type : null);

  const allWorkouts = await Workout.find().lean();

  const suggestionsWithReason = allWorkouts.map((workout) => {
    const reason = generateReason(matchingFocus, Array.from(activityTypes), workout.focus);
    return {
      ...workout,
      reason,
    };
  });

  suggestionsWithReason.sort((a, b) => {
    const aIsPrimary = a.focus === matchingFocus ? 1 : 0;
    const bIsPrimary = b.focus === matchingFocus ? 1 : 0;
    return bIsPrimary - aIsPrimary;
  });

  return suggestionsWithReason;
}

function generateReason(fitnessGoal: string | null, activityTypes: string[], workoutFocus: string): string {
  if (workoutFocus === fitnessGoal && fitnessGoal) {
    return `Matches your fitness goal: ${fitnessGoal}.`;
  }
  if (activityTypes.includes(workoutFocus)) {
    return `Matches your recent activity: ${workoutFocus}.`;
  }
  if (activityTypes.length > 0) {
    return `Complements your recent activity: ${activityTypes[0]}.`;
  }
  return 'Based on available workouts.';
}

export { User };
