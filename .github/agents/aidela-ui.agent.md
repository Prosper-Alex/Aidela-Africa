---
name: aidela-ui-agent
description: "Workspace agent for Aidela Africa frontend UI styling and componentization. Use when editing or refactoring styles, components, and classnames in `frontend/aidela-africa`. Triggers: btn-primary, card, badge, page, input, navbar, job card, status badge, design system, tailwind refactor."
applyTo:
  - "frontend/aidela-africa/**"
author: "Automated assistant"
---

# Aidela UI Agent

Purpose: Enforce and evolve the Aidela Africa frontend design system. This agent is picked when the task involves styling, Tailwind utility refactors, or component class standardization under `frontend/aidela-africa`.

**Quick Rules**

- Never use raw utility color combos such as `className="bg-blue-500 text-white"`.
- Always prefer named design-system classes (examples: `btn`, `btn-primary`, `card`, `card-hover`, `badge-warning`).
- Add or change visual tokens only inside `frontend/aidela-africa/src/index.css` within the `@layer components` block using `@apply`.
- Keep classnames semantic, hyphenated, and lowercase (e.g., `btn-primary`, not `btn--primary`).
- When refactoring, produce a minimal diff that updates JSX usage and the `index.css` component rules together.

**Where to use**

- Use this agent for styling, componentization, and Tailwind-to-design-system refactors in the frontend.
- Prefer this agent over the default when the change touches classes, CSS, or component markup.

**How it operates**

- It may create or edit files in the workspace (`.css`, `.jsx/.tsx`, or MD docs).
- It will propose and write `@apply`-based rules to `frontend/aidela-africa/src/index.css` and update JSX to use the named classes.
- It will avoid running network requests or changing backend/server logic.

**Examples (real usage)**

Button

```jsx
<button className="btn-primary">Apply Now</button>
```

Job Card

```jsx
<div className="card card-hover">
  <h3 className="title">Frontend Developer</h3>
  <p className="subtitle">Aidela Africa • Lagos</p>
</div>
```

Status Badges

```jsx
<span className="badge-warning">Pending</span>
<span className="badge-success">Accepted</span>
<span className="badge-error">Rejected</span>
```

Page Layout

```jsx
<div className="page">
  <div className="container">
    <h1 className="title">Jobs</h1>
  </div>
</div>
```

Input Field

```jsx
<input type="text" placeholder="Search jobs..." className="input" />
```

Navbar

```jsx
<nav className="navbar">
  <h1 className="title">Aidela Jobs</h1>
</nav>
```

**Why this is better**

- Named reusable classes remove color/spacing thinking from per-component work.
- Ensures consistent UI across pages and reduces duplication.
- Makes future theme/token changes simple (edit one CSS rule).

**Suggested prompts**

- "Refactor `JobCard.jsx` to use design-system classes instead of raw utilities."
- "Add a `badge-info` variant to the design system and update examples."
- "Create a `Btn` component that maps `variant='primary'` → `btn-primary`."

**Ambiguities / Questions**

- Naming convention: currently this agent uses `kebab-case` (`btn-primary`). Confirm if you prefer BEM or another convention.
- Variants: do you want modifier classes (`btn--primary`) or standalone variant classes (`btn-primary`)? Default: `btn-primary`.
- Scope: should the agent also modify isolated component styles (CSS Modules) or only global design-system classes? Default: global classes in `index.css`.

If you confirm preferences for the three questions above I will finalize the agent and update examples accordingly.
