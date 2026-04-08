# Task 35 Self-Review Report (Current Pass)

## Review Scope

Frontend interaction and UI-contract code paths reviewed:

- `apps/frontend/src/components/articles/article-form.tsx`
- `apps/frontend/src/components/articles/article-detail-view.tsx`
- `apps/frontend/src/components/articles/article-version-history-panel.tsx`
- `apps/frontend/src/components/articles/article-bookmark-button.tsx`
- `apps/frontend/src/components/articles/article-comments-card.tsx`
- `apps/frontend/src/components/articles/article-reaction-bar.tsx`
- `apps/frontend/src/components/layout/notification-bell.tsx`
- `apps/frontend/src/components/editor/article-editor.tsx`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/lib/auth.ts`
- `apps/frontend/src/lib/server-auth.ts`
- `apps/frontend/src/app/articles/[articleId]/page.tsx`
- `apps/frontend/src/app/articles/[articleId]/edit/page.tsx`

## Problematic Patterns Identified

### 1. Hardcoded content-driven conditional rendering

- Risky code: `shouldRenderEngagementPanel()` gates engagement by exact article title string.
- Why risky: UI behavior depends on mutable content value rather than permission/configuration.
- Impact: A title rename can hide a whole interaction area unintentionally.
- Minimal fix: Remove title-based guard; use explicit feature flag or role/status-based condition.

### 2. Authorization UI mismatch in article detail actions

- Risky code: Edit/Delete controls render for all users.
- Why risky: Controls invite actions that will predictably fail/redirect for unauthorized users.
- Impact: confusing UX and unnecessary forbidden/error navigation churn.
- Minimal fix: gate action rendering with current user + ownership/role check before showing controls.

### 3. Stale state race in tag input submission

- Risky code: `commitTagInput()` updates `tags` state asynchronously, `submit()` reads current `tags` immediately.
- Why risky: blur-triggered tag commit and button click can occur in same interaction frame.
- Impact: dropped last tag in create/update payload.
- Minimal fix: compute `effectiveTags` in submit by merging current state with trimmed `tagsInput` before request.

### 4. Validation pipeline bypass in article form

- Risky code: buttons call custom `submit()` directly instead of `handleSubmit`/`trigger`.
- Why risky: react-hook-form rules are declared but not enforced before API call.
- Impact: delayed error feedback and backend-first validation for basic input errors.
- Minimal fix: wrap submit with `form.handleSubmit` and render per-field validation messages.

### 5. Role-check drift risk in edit page loader

- Risky code: edit loader enforces strict ownership (`article.author.id !== currentUser.id`).
- Why risky: any future backend role exception (e.g., editor override) can diverge from frontend behavior.
- Impact: unauthorized redirect from frontend even when backend might allow action.
- Minimal fix: centralize policy rules in shared helper/DTO or rely on backend response for final permission outcome.

## Additional Checks

- Hook dependency review: no immediate unstable dependency loops detected in reviewed files.
- Controlled inputs: generally consistent, but article form submits without preflight validation.
- Null/undefined guards: adequate in most API render paths; version panel and search UI include safe fallbacks.
- Build verification:
  - `npm run build --workspace=frontend` passed.
  - `npm run build --workspace=backend` passed.

## Residual Risks

- Dynamic route pages still depend on runtime auth/API state; full browser E2E matrix was not automated in this pass.
- UI-permission visibility can regress if auth policy changes without mirrored frontend check updates.
- Dense local state in comments/article form remains maintainable but error-prone for future feature growth.

## Self-Review Conclusion

Current codebase is build-stable, but not fully interaction-stable. One critical conditional-rendering issue and multiple high/medium UX-contract issues remain and should be fixed before marking Task 35 fully complete.