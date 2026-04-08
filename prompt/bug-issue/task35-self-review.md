# Task 35 Self-Review Report

## Review Scope

The review covered the main interactive frontend surface and the code paths directly involved in Task 35 findings:

- `src/components/studio/draft-studio.tsx`
- `src/components/layout/notification-bell.tsx`
- `src/components/layout/auth-session-control.tsx`
- `src/components/articles/article-bookmark-button.tsx`
- `src/components/articles/article-reaction-bar.tsx`
- `src/components/articles/article-comments-card.tsx`
- `src/components/articles/article-helpfulness-card.tsx`
- `src/lib/auth.ts`
- `src/app/layout.tsx`

## Findings And Fixes

### 1. Effect and state management misuse in draft studio

- Risky pattern: `useEffectEvent` callbacks were being used from click handlers and also fed into effect dependency chains.
- Root cause: The component mixed effect-only utilities with general event-handler usage, which made request lifecycles hard to reason about and contributed to repeated draft-loading traffic.
- Fix applied: Replaced the effect-event approach with stable callbacks plus refs for current async entry points and interval usage.
- Outcome: Studio load, save, publish, and navigation behavior became stable and lint-clean.

### 2. Client/server auth contract drift

- Risky pattern: Client auth state depended on `localStorage`, while server-protected navigation depended on the auth cookie.
- Root cause: `getStoredAccessToken()` ignored the cookie when local storage was empty, and `NotificationBell` read token state during render.
- Fix applied:
  - Added cookie fallback and local-storage bootstrap in `src/lib/auth.ts`.
  - Moved notification visibility to state synchronized in an effect.
- Outcome: Fresh-tab behavior now converges correctly and the hydration mismatch was removed.

### 3. Conditional UI drift across article interactions

- Risky pattern: Helpfulness had clear auth-aware affordances, but bookmark, reaction, and comments were less consistent.
- Root cause: Each interaction component evolved its own auth presentation rules.
- Fix applied:
  - Disabled bookmark and reaction actions for anonymous users.
  - Added clear login-oriented labels and helper copy.
  - Updated comments placeholders, helper text, reply visibility, and empty state text to reflect actual auth state.
- Outcome: Article engagement controls now present a coherent auth model to anonymous users.

### 4. Overfetching in bookmark state lookup

- Risky pattern: A per-article control fetched `/bookmarks` and filtered client-side.
- Root cause: The frontend did not consume the narrower bookmark-status endpoint already available in the backend.
- Fix applied: Switched `ArticleBookmarkButton` to `/articles/:articleId/bookmark-status`.
- Outcome: Lower request cost and less duplicated client-side filtering.

### 5. Minor platform warning from root layout

- Risky pattern: Smooth scrolling was enabled without the attribute Next.js expects for route transitions.
- Root cause: The root layout omitted `data-scroll-behavior="smooth"`.
- Fix applied: Added the attribute to `src/app/layout.tsx`.
- Outcome: The repeated console warning is removed.

## Residual Risks

- The task validation covered the main live pages and interaction paths, but the tag page was not re-executed in-browser during this pass because the visible test articles in the exercised dataset did not expose tag chips.
- The comments component still manages local mutation state in-place rather than through a shared interaction hook. It is functional now, but the logic remains relatively dense.
- The archive now surfaces locally published validation content such as `Untitled draft` if that content has been published in the test database. That is test-data drift, not a frontend rendering defect.

## Validation Summary

- Final lint status: `npm run lint` passed.
- Final browser pass confirmed:
  - Anonymous header and article interactions behave consistently.
  - AUTHOR login, studio access, draft create/publish, bookmarks, reactions, helpfulness, comments, and search work.
  - EDITOR login and studio access work.
  - Notification drawer opens correctly.

## Self-Review Conclusion

The Task 35 fixes addressed the highest-risk issues at the correct layer: hook lifecycle misuse, auth-state synchronization, and inconsistent UI gating. No unresolved critical issue remains from the areas exercised in this pass.