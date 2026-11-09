---
paths:
  - "vite.config.mts"
  - "src/pages/demos/**"
  - "src/hooks/useRemoteComponent.tsx"
---

# Module Federation

- This app is the host `main_app`. The remote `demos` (Konva canvas) lives in a separate repo (`Sew-a/micro-canvas-app`); its URL comes from `VITE_REMOTE_DEMOS_URL`.
- React, react-dom and react-router-dom are shared singletons. If you bump any of them, update `requiredVersion` in `vite.config.mts` and tell the user the remote must match.
- Remote loading happens at runtime (`src/pages/demos/federation.ts`, `useRemoteComponent`), which mounts the remote into its own React root.
- If the remote isn't running locally, `/demos` shows an error state. That is expected; don't "fix" it.
