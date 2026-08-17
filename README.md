# Pocket — Expense Tracker (Team Project)

A React + Vite expense tracker built by 6 students, one feature per branch.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Hot reload is on — save a file and the
page updates.

## Branch structure

`main` has the shared scaffold everyone builds on: routing, the shared
state (`ExpenseContext`), the navbar, and base styles. **Nobody commits
directly to `main`** — each student works on their own branch and opens
a pull request when their feature is ready.

| Branch | Owner builds | File to start in |
|---|---|---|
| `feature/dashboard` | Overview page — totals, spend by category, recent activity | `src/pages/Dashboard.jsx` |
| `feature/expense` | Add / edit / delete expenses | `src/pages/Expenses.jsx` |
| `feature/categories` | Add / edit / delete categories | `src/pages/Categories.jsx` |
| `feature/budget` | Set a spending limit per category + progress view | `src/pages/Budget.jsx` |
| `feature/reports` | Filter expenses, totals, CSV export or trend chart | `src/pages/Reports.jsx` |
| `feature/auth` | Login/signup + profile settings | `src/pages/Account.jsx` |

Each page file already has a comment block at the top explaining the
goal for that feature and which shared data/functions are already
available from `ExpenseContext`.

## The shared state

All data lives in `src/context/ExpenseContext.jsx` and is read with one
hook:

```jsx
import { useExpenses } from '../context/ExpenseContext'

const { expenses, categories, addExpense } = useExpenses()
```

This is the one file that's shared by everyone — **don't rename or
delete existing fields/functions**, since other branches depend on
them. If you need something new added to the shared state (a new
field, a new function), say so in the team chat before changing it,
since it can cause merge conflicts.

## Git workflow

1. Clone the repo, then check out your branch:
   ```bash
   git checkout feature/expense
   ```
2. Work and commit normally on your branch.
3. Push your branch and open a pull request into `main` when your
   feature works:
   ```bash
   git push origin feature/expense
   ```
4. Before opening the PR, pull the latest `main` into your branch to
   catch conflicts early:
   ```bash
   git checkout main
   git pull
   git checkout feature/expense
   git merge main
   ```
5. One teammate (or the project lead) reviews and merges each PR into
   `main`.

## Notes

- Data is all in-memory (`src/data/mockData.js`) — nothing persists on
  refresh yet. That's expected; it's not any single feature's job to fix
  unless the team decides to add persistence (e.g. `localStorage`) as a
  stretch goal.
- Keep styling additions in `src/styles/index.css` using the existing
  CSS variables (`--accent`, `--surface`, etc.) so pages stay visually
  consistent — see `:root` at the top of the file.
