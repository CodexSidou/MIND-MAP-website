# MindMap Pro

Think visually. Build anything.

A free, local-first, infinite mind-mapping and visual workspace tool. 100% free, no account, no backend, no paid APIs — everything runs in your browser and is stored in IndexedDB.

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Deployment

Push to GitHub. GitHub Actions automatically deploys the application to GitHub Pages.

Enable it once:

```text
Repository → Settings → Pages → Source: GitHub Actions
```

The app is built for the repository subpath (`/MIND-MAP-website/`) via the `base` option in `vite.config.ts`. Change `base` if your repository name differs.

## Features

- Infinite white canvas with subtle dot grid
- Nodes: ideas, tasks, notes, projects, goals, questions, decisions, links, images, checklists, shapes, sticky notes, frames
- Curved connections with labels, arrows, auto-follow
- Groups/frames, collapse/expand branches, multi-select, duplicate, copy/paste
- Undo/redo history, command palette (Ctrl+K), global search (Ctrl+F)
- Context menus, minimap, snap-to-grid, zoom controls
- Workspaces: multiple mind maps, favorites, trash
- Autosave with IndexedDB, export/import JSON, Markdown, PNG, SVG
- Templates: project planning, startup, website, cybersecurity, study roadmap
- Settings: language (EN/FR/AR with RTL), grid, snap, data management
- Optional AI mind-map generation (bring your own API key); fully functional without it

## Tech

Vite · React · TypeScript · Tailwind CSS · @xyflow/react (React Flow) · Zustand · idb · Lucide React · html-to-image
