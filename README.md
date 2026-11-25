# FocusFlow v2

FocusFlow is a local-first productivity dashboard for organizing tasks and projects, running focused Pomodoro sessions, and keeping track of your daily progress.

## Features

- **Overview dashboard** with today's focus totals and project progress.
- **Task management** with project assignment, filters, completion tracking, and task-linked focus sessions.
- **Project organization** to group related work and track completion.
- **Pomodoro timer** with focus, short-break, and long-break modes, session tracking, and timer state preserved across reloads.
- **Local data storage** so your tasks, projects, timer state, and focus sessions stay in your browser.
- **JSON workspace backup** to export and restore your productivity data.

## Getting started

### Requirements

- Node.js and npm

### Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

### Run with Docker

```bash
docker compose up -d --build
```

Open [http://localhost:8080](http://localhost:8080). To stop the container, run:

```bash
docker compose down
```

## Data and privacy

FocusFlow has no application backend or account system. Workspace data is stored in your browser's `localStorage` and is not synchronized between browsers or devices. Use the in-app JSON export regularly to keep a backup. Clearing browser data can remove your workspace.

## Built with

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide

## Project documentation

- [Product specification](PRODUCT.md)
- [Design notes](DESIGN.md)
