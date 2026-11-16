# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the React frontend separated from  business logic and access backend functionality only through the shared API client using relative /api routes proxied by Vite.
- Logic tier decision: Implement and validate all Express API endpoints according to the documented API contract and return deliberate 4xx errors for invalid input instead of unhandled server errors.
- Data tier decision: Use Mongoose models with schema validation and MongoDB persistence. Ensure users, teams, and activities are validated before storage.
- Activity tracking approach: Validate userId and teamId, calculate activity points from submitted activity data, store occurredAt automatically, and prevent Mongoose cast errors from reaching clients.
- Team management approach: Require a team name, store mascot and member information, and expose create and list operations through the API.
- Leaderboard approach: Aggregate activity points by team, sort totals in descending order, and generate a 1-based rank for each team.
- Workout suggestions approach: Analyze seeded user goals and recent activity patterns to return personalized workout recommendations with a focus area and explanatory reason.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
    - Result: 4 failures, 1 passing test.
    - Failure meaning:
        - User model is not enforcing required `name`, `email`, and `fitnessGoal`.
        - Team model is not enforcing required `name` and `mascot`.
        - Activity model is not enforcing required `type`, `user`, and `team`.
        - Workout model is not enforcing required `focus`, `minutes`, and `difficulty`.
        - Seed data is loading successfully.
- API command: `npm run test:api --prefix octofit-tracker/backend`
    - Result: 4 failures.
    - Failure meaning:
        - Activity endpoints return placeholder `501` responses instead of contract-compliant `400` and `201` responses.
        - Team endpoints return placeholder `501` responses instead of validation and creation responses.
        - Leaderboard endpoint does not aggregate activity points.
        - Workout suggestion endpoint does not generate contract-compliant recommendations and reasons.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
    - Result: Multiple failures across all capability pages.
    - Failure meaning:
        - Activities page still displays "Implementation pending".
        - Teams page still displays "Implementation pending".
        - Leaderboard page still displays "Implementation pending".
        - Workout suggestions page still displays "Implementation pending".
        - Empty-state messaging and accessible alert handling are not implemented.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
    - Result: Passed.
    - Meaning: TypeScript backend compiles successfully.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
    - Result: Passed.
    - Meaning: Frontend builds successfully with Vite and TypeScript.
