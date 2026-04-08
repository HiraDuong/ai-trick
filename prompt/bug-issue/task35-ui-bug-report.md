# Task 35 UI Bug Report (Current Pass)

## Coverage

- Runtime checks executed with live frontend/backend (`npm run build --workspace=frontend`, `npm run build --workspace=backend` both pass).
- UI interaction and state logic validated through code-path review of all major interactive components and routes.
- Scope includes buttons, inputs, forms, conditional role/auth rendering, and API-driven UI behaviors.

## Overall UI Health Status

Core flows are generally healthy (build-stable, no blocking compile errors), but there are unresolved interaction/conditional-rendering issues. One critical issue is still present and can hide engagement UI completely under a title-based condition.

## Critical Issues Requiring Fixes

1. Engagement panel hides for a specific article title due to hardcoded string logic.
2. Edit/Delete article controls are always rendered even for unauthorized users.
3. Last typed tag can be dropped when user clicks Publish/Save without pressing Enter first.

## Bug Report By Category

### Buttons

#### Bug B1: Unauthorized users see destructive/edit controls they cannot use

- Title: Edit/Delete buttons are always visible on article detail.
- Description: `Edit article` and `Delete article` controls are rendered unconditionally, even when user is anonymous or lacks permission.
- Steps to reproduce:
  1. Open any published article while logged out.
  2. Observe top-right actions.
  3. Click `Edit article` or `Delete article`.
- Expected result: Unauthorized users should not see restricted controls.
- Actual result: Controls are visible and lead to redirect/error flow after click.
- Severity: High.
- Affected component/page: `apps/frontend/src/components/articles/article-detail-view.tsx`.
- Screenshots or logs: User-visible on article detail header action group.

### Inputs

#### Bug I1: Last tag input may be lost on immediate submit click

- Title: Tag chip creation races with submit.
- Description: If user types a tag and clicks `Xuất bản`/`Lưu nháp` immediately (without Enter), `onBlur` commits tag via async state update, but submit reads stale `tags` state.
- Steps to reproduce:
  1. Open create/edit article form.
  2. Type a new tag in the tag input.
  3. Click `Xuất bản` directly.
- Expected result: Newly typed tag is included in payload.
- Actual result: Last typed tag can be missing in request.
- Severity: Medium.
- Affected component/page: `apps/frontend/src/components/articles/article-form.tsx`.
- Screenshots or logs: Code-path race between `commitTagInput()` and `submit()`.

### Forms

#### Bug F1: react-hook-form validation rules are not enforced before submit

- Title: Form buttons bypass `react-hook-form` validation pipeline.
- Description: Submit buttons use `type="button"` and call `submit()` directly with `form.getValues()`; `form.trigger()`/`handleSubmit()` is not used.
- Steps to reproduce:
  1. Open create article page.
  2. Keep invalid/empty values.
  3. Click `Lưu nháp` or `Xuất bản`.
- Expected result: Client validation errors shown before API call.
- Actual result: Invalid payload can be sent to backend first; user only sees server-side error.
- Severity: Medium.
- Affected component/page: `apps/frontend/src/components/articles/article-form.tsx`.
- Screenshots or logs: No client-side error rendering for form rules.

### Conditional UI

#### Bug C1: Engagement panel hidden by hardcoded title match

- Title: Engagement panel visibility depends on exact title string.
- Description: `shouldRenderEngagementPanel()` hides engagement section when title equals `"Building a reliable knowledge-sharing workflow"`.
- Steps to reproduce:
  1. Create or rename an article to exactly `Building a reliable knowledge-sharing workflow`.
  2. Open detail page.
- Expected result: Engagement panel rendering should depend on permission/config, not content title.
- Actual result: Comments/helpfulness/reactions/stats panel is fully hidden.
- Severity: Critical.
- Affected component/page: `apps/frontend/src/components/articles/article-detail-view.tsx`.
- Screenshots or logs: Hardcoded title check in render guard.

### API-driven UI

#### Bug A1: Edit form role gating is frontend-author-only

- Title: Edit page client-side authorization assumes only author can edit.
- Description: After loading article + `/auth/me`, UI redirects to `/forbidden` when `article.author.id !== currentUser.id`; no role override path exists.
- Steps to reproduce:
  1. Log in as non-author contributor role.
  2. Open `/articles/{id}/edit` for another user’s article.
  3. Observe redirect behavior.
- Expected result: Frontend check should match backend policy exactly (including role-based overrides if applicable).
- Actual result: Frontend hard-enforces author ownership.
- Severity: High (policy drift risk).
- Affected component/page: `apps/frontend/src/components/articles/article-form.tsx`.
- Screenshots or logs: Ownership-only check inside `loadArticle()`.

## Final Result

- Unresolved critical issues remain: 1 (`Bug C1`).
- Unresolved high issues remain: 2 (`Bug B1`, `Bug A1`).
- Medium issues remain: 2 (`Bug I1`, `Bug F1`).