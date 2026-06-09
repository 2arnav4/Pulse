export const DEMO_USER = {
  id: -1,
  username: "Demo User",
  email: "demo@pulse.app",
};

let nextWorkspaceId = 9003;
let nextTaskId = 100;
let nextUserId = 300;

const createSeedData = () => {
  const now = new Date().toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const members = {
    9001: [
      {
        id: DEMO_USER.id,
        username: DEMO_USER.username,
        email: DEMO_USER.email,
        role: "admin",
        joinedAt: weekAgo,
      },
      {
        id: 201,
        username: "Alex Chen",
        email: "alex@example.com",
        role: "member",
        joinedAt: weekAgo,
      },
      {
        id: 202,
        username: "Sam Rivera",
        email: "sam@example.com",
        role: "member",
        joinedAt: weekAgo,
      },
    ],
    9002: [
      {
        id: DEMO_USER.id,
        username: DEMO_USER.username,
        email: DEMO_USER.email,
        role: "admin",
        joinedAt: weekAgo,
      },
      {
        id: 203,
        username: "Jordan Lee",
        email: "jordan@example.com",
        role: "member",
        joinedAt: weekAgo,
      },
    ],
  };

  const workspaces = [
    {
      id: 9001,
      name: "Product Launch",
      description: "Q3 go-to-market planning and execution",
      role: "admin",
      joinedAt: weekAgo,
    },
    {
      id: 9002,
      name: "Engineering Sprint",
      description: "Sprint board for the core platform team",
      role: "admin",
      joinedAt: weekAgo,
    },
  ];

  const workspaceDetails = {
    9001: {
      workspace: {
        id: 9001,
        name: "Product Launch",
        description: "Q3 go-to-market planning and execution",
        createdAt: weekAgo,
      },
      members: members[9001],
    },
    9002: {
      workspace: {
        id: 9002,
        name: "Engineering Sprint",
        description: "Sprint board for the core platform team",
        createdAt: weekAgo,
      },
      members: members[9002],
    },
  };

  const tasks = {
    9001: [
      {
        id: 1,
        title: "Finalize landing page copy",
        description: "Review hero section and CTA with marketing",
        status: "in-progress",
        workspaceId: 9001,
        assignedTo: 201,
        Assignee: { id: 201, username: "Alex Chen" },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: "Set up analytics dashboard",
        description: "Track signups, activation, and retention",
        status: "todo",
        workspaceId: 9001,
        assignedTo: 202,
        Assignee: { id: 202, username: "Sam Rivera" },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        title: "Launch checklist review",
        description: "Cross-team sign-off before release",
        status: "done",
        workspaceId: 9001,
        assignedTo: DEMO_USER.id,
        Assignee: { id: DEMO_USER.id, username: DEMO_USER.username },
        createdAt: now,
        updatedAt: now,
      },
    ],
    9002: [
      {
        id: 4,
        title: "Refactor auth middleware",
        description: "Improve token validation and error handling",
        status: "in-progress",
        workspaceId: 9002,
        assignedTo: 203,
        Assignee: { id: 203, username: "Jordan Lee" },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        title: "Add workspace search",
        description: "Filter workspaces on the dashboard",
        status: "todo",
        workspaceId: 9002,
        assignedTo: DEMO_USER.id,
        Assignee: { id: DEMO_USER.id, username: DEMO_USER.username },
        createdAt: now,
        updatedAt: now,
      },
    ],
  };

  return { workspaces, workspaceDetails, members, tasks };
};

let store = createSeedData();

export function resetDemoStore() {
  store = createSeedData();
  nextWorkspaceId = 9003;
  nextTaskId = 100;
  nextUserId = 300;
}

export function isDemoMode() {
  return localStorage.getItem("Pulse_demo_mode") === "true";
}

function parseBody(data) {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data;
}

function reject(status, message) {
  const error = new Error(message);
  error.response = { status, data: { message } };
  throw error;
}

function mockStandup(workspaceId) {
  const tasks = store.tasks[workspaceId] || [];
  const lines = tasks.map(
    (t) =>
      `- **${t.Assignee?.username || "Unassigned"}**: [${t.status}] ${t.title}`,
  );

  return {
    standup: `## Daily Standup (Demo)

Here's a sample AI-generated standup based on current task activity:

${lines.join("\n")}

### Blockers
- Waiting on design review for landing page assets

### Today's Focus
- Push analytics dashboard to staging
- Complete auth middleware refactor

*This is sample demo content — connect a real account for live AI standups.*`,
  };
}

export function handleDemoRequest(config) {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").replace(/^\//, "");
  const path = url.startsWith("api/") ? url.slice(4) : url;
  const body = parseBody(config.data);

  if (path === "workspaces" && method === "get") {
    return { data: store.workspaces, status: 200 };
  }

  if (path === "workspaces" && method === "post") {
    const name = body.name?.trim();
    if (!name) reject(400, "Workspace name is required");

    const id = nextWorkspaceId++;
    const createdAt = new Date().toISOString();
    const workspace = {
      id,
      name,
      description: body.description?.trim() || "",
      createdAt,
    };

    store.workspaces.push({
      id,
      name: workspace.name,
      description: workspace.description,
      role: "admin",
      joinedAt: createdAt,
    });

    store.workspaceDetails[id] = {
      workspace,
      members: [
        {
          id: DEMO_USER.id,
          username: DEMO_USER.username,
          email: DEMO_USER.email,
          role: "admin",
          joinedAt: createdAt,
        },
      ],
    };
    store.members[id] = store.workspaceDetails[id].members;
    store.tasks[id] = [];

    return {
      data: { message: "Workspace created successfully", workspace },
      status: 201,
    };
  }

  const wsMatch = path.match(/^workspaces\/(\d+)$/);
  if (wsMatch && method === "get") {
    const id = parseInt(wsMatch[1], 10);
    const detail = store.workspaceDetails[id];
    if (!detail) reject(404, "Workspace not found");
    return { data: detail, status: 200 };
  }

  if (wsMatch && method === "delete") {
    const id = parseInt(wsMatch[1], 10);
    store.workspaces = store.workspaces.filter((w) => w.id !== id);
    delete store.workspaceDetails[id];
    delete store.members[id];
    delete store.tasks[id];
    return { data: { message: "Workspace permanently deleted!" }, status: 200 };
  }

  const memberMatch = path.match(/^workspaces\/(\d+)\/members$/);
  if (memberMatch && method === "post") {
    const id = parseInt(memberMatch[1], 10);
    const email = body.email?.trim();
    if (!email) reject(400, "Email is required");
    if (!store.workspaceDetails[id]) reject(404, "Workspace not found");
    if ((store.members[id] || []).some((m) => m.email === email)) {
      reject(400, "User is already in this workspace");
    }

    const username = email.split("@")[0];
    const newMember = {
      id: nextUserId++,
      username,
      email,
      role: "member",
      joinedAt: new Date().toISOString(),
    };

    store.members[id] = [...(store.members[id] || []), newMember];
    store.workspaceDetails[id].members = store.members[id];

    return {
      data: { message: "Member added successfully", member: newMember },
      status: 201,
    };
  }

  const removeMemberMatch = path.match(/^workspaces\/(\d+)\/members\/(\d+)$/);
  if (removeMemberMatch && method === "delete") {
    const wsId = parseInt(removeMemberMatch[1], 10);
    const userId = parseInt(removeMemberMatch[2], 10);
    if (userId === DEMO_USER.id) reject(400, "You cannot remove yourself");

    store.members[wsId] = (store.members[wsId] || []).filter(
      (m) => m.id !== userId,
    );
    if (store.workspaceDetails[wsId]) {
      store.workspaceDetails[wsId].members = store.members[wsId];
    }
    (store.tasks[wsId] || []).forEach((t) => {
      if (t.assignedTo === userId) {
        t.assignedTo = null;
        t.Assignee = null;
      }
    });

    return { data: { message: "Member removed successfully" }, status: 200 };
  }

  const tasksMatch = path.match(/^workspaces\/(\d+)\/tasks$/);
  if (tasksMatch && method === "get") {
    const id = parseInt(tasksMatch[1], 10);
    return { data: store.tasks[id] || [], status: 200 };
  }

  if (tasksMatch && method === "post") {
    const id = parseInt(tasksMatch[1], 10);
    if (!store.workspaceDetails[id]) reject(404, "Workspace not found");
    const taskId = nextTaskId++;
    const title = body.title?.trim();
    if (!title) reject(400, "Task title is required");
    const assignedTo = body.assignedTo ?? null;
    const member = (store.members[id] || []).find((m) => m.id === assignedTo);

    const newTask = {
      id: taskId,
      title,
      description: body.description?.trim() || "",
      status: "todo",
      workspaceId: id,
      assignedTo,
      Assignee: member
        ? { id: member.id, username: member.username }
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!store.tasks[id]) store.tasks[id] = [];
    store.tasks[id].push(newTask);

    return { data: newTask, status: 201 };
  }

  const taskUpdateMatch = path.match(/^workspaces\/(\d+)\/tasks\/(\d+)$/);
  if (taskUpdateMatch && method === "put") {
    const wsId = parseInt(taskUpdateMatch[1], 10);
    const taskId = parseInt(taskUpdateMatch[2], 10);
    const task = (store.tasks[wsId] || []).find((t) => t.id === taskId);
    if (!task) reject(404, "Task not found");

    if (body.status) task.status = body.status;
    task.updatedAt = new Date().toISOString();

    return { data: task, status: 200 };
  }

  const standupMatch = path.match(/^workspaces\/(\d+)\/standup$/);
  if (standupMatch && method === "get") {
    const id = parseInt(standupMatch[1], 10);
    return { data: mockStandup(id), status: 200 };
  }

  reject(404, "Demo endpoint not found");
}
