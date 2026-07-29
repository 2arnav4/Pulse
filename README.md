# Pulse

A workspace collaboration platform. Teams create workspaces, invite members as
admins or members, run a kanban board, and generate a standup summary from
whatever moved in the last 24 hours.

**[Live demo](https://pulse-nu-liard.vercel.app)** — click *Try Demo* on the login
screen. No account, no signup, no backend required. See [Demo mode](#demo-mode)
for why that works.

<!-- TODO: add a screenshot or GIF of the task board here. It is the first thing
     a visitor looks for and this README is weaker without it. -->

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19 (Vite), CSS Modules, React Router, Axios, Framer Motion |
| Backend | Node, Express 5, Sequelize |
| Database | PostgreSQL |
| Auth | JWT, bcrypt |
| AI | Groq SDK (`llama-3.1-8b-instant`) |

## Features

- Email and password auth with JWT, rate limited to 5 attempts per 15 minutes per IP
- Multiple workspaces per user, with `admin` and `member` roles
- Kanban board with `todo` / `in-progress` / `done`, and optimistic status updates
- Admin-only invite by email, remove member, and delete workspace
- AI standup that groups the last 24 hours of task activity by assignee
- Analytics page with hand-built SVG charts (no chart library)
- Demo mode that runs the entire app with no backend

## The part worth reading: membership is not authentication

Every workspace route takes an id straight from the URL:

```
GET /api/workspaces/:id/tasks
```

`authMiddleware` proves you are *someone*. It does not prove you belong to
workspace `:id`. If that is the only check, any logged in user reads any team's
board by editing a number in the URL. That class of bug is called an IDOR
(insecure direct object reference), and it is easy to ship because the endpoint
looks correct in testing when you only ever call it with your own ids.

So there is a second, separate check:

```js
const isUserInWorkspace = async (userId, workspaceId) => {
    return await WorkspaceMember.findOne({ where: { userId, workspaceId } });
};
```

It runs on every route that touches workspace data, and the three destructive
actions (invite, remove member, delete workspace) re-query with `role: "admin"`
on top of it.

I originally missed this on the standup endpoint. Reading, tasks, and updates
were all guarded, and the one route added last was not, which is exactly where
this kind of gap tends to hide.

## Demo mode

The frontend runs standalone. `enterDemoMode()` sets a flag in `localStorage`,
and the Axios request interceptor swaps in a custom adapter that resolves calls
against an in-memory fixture store instead of the network:

```js
if (isDemoMode()) {
    config.adapter = async (cfg) => {
        const { data, status } = handleDemoRequest(cfg);
        return { data, status, statusText: 'OK', headers: {}, config: cfg };
    };
    return config;
}
```

Swapping the adapter rather than mocking each call site means every component
keeps using the same `api.get` / `api.post` it always did, and no component
knows demo mode exists.

It was written for a practical reason. The API runs on a free tier that sleeps,
and a cold start is around 50 seconds. Nobody waits 50 seconds to look at a side
project.

## API

| Method | Route | Notes |
| --- | --- | --- |
| POST | `/api/auth/register` | Rate limited |
| POST | `/api/auth/login` | Rate limited |
| GET | `/api/auth/me` | Current user |
| POST | `/api/workspaces` | Creates workspace + admin membership in one transaction |
| GET | `/api/workspaces` | Workspaces you belong to |
| GET | `/api/workspaces/:id` | Workspace + member list |
| POST | `/api/workspaces/:id/members` | Invite by email (admin) |
| DELETE | `/api/workspaces/:id/members/:userId` | Remove member (admin) |
| GET | `/api/workspaces/:id/tasks` | List tasks |
| POST | `/api/workspaces/:id/tasks` | Create task |
| PUT | `/api/workspaces/:id/tasks/:taskId` | Update status |
| GET | `/api/workspaces/:id/standup` | Groq standup, last 24h |
| DELETE | `/api/workspaces/:id` | Delete workspace (admin) |
| GET | `/health` | Health check |

Workspace creation writes the workspace row and the creator's admin membership
inside a single Sequelize transaction, so a failure halfway cannot leave a
workspace nobody can administer.

## Running locally

Requires Node 20+ and a PostgreSQL database.

```bash
# Backend
cd Backend
npm install
cp .env.example .env      # then fill it in
npm run dev               # http://localhost:4000

# Frontend
cd Frontend
npm install
npm run dev               # http://localhost:5173
```

`Backend/.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/pulse_dev
JWT_SECRET=<a long random string>
GROQ_API_KEY=<from console.groq.com>
PORT=4000
```

Tables are created by `sequelize.sync({ alter: true })`, which **only runs when
`NODE_ENV` is not `production`**. On a fresh production database you have to
deploy once without that variable set, or you get a running server with no
tables.

## Known gaps

Kept here deliberately rather than left to be discovered:

- The task board is a `<select>` per card, not drag and drop.
- No test suite.
- No real-time updates. Two people on the same board need a refresh to see each
  other's changes.
- `node_modules` was committed early in this repo's history, so a clone pulls
  more than it should. Removing it means rewriting history.
