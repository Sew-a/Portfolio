---
name: verify
description: Run the same checks CI runs (lint, typecheck, build) and report results. Use after any code change and before saying work is done or committing.
---

# Verify

Run in order and stop at the first failure:

```bash
npm run lint
npm run build   # runs tsc --noEmit, then vite build
```

- `tsc` (strict) is the real correctness gate; ESLint has most TS rules off but enforces the `@/src/...` import rule and hooks rules.
- Report the exact errors with file:line. Fix them; don't silence rules or add `@ts-ignore`.
- A build warning about chunk size or federation is not a failure, but mention new ones.
- For UI changes, also run the app (`npm run dev`, port 3000) and check the affected route in dark and light themes and at mobile width. `/demos` erroring without the remote running is expected.
