# Task 28 Article Feature Audit

## Summary Verdict

The current article feature implementation is partially complete and structurally solid on the backend, but it is not yet sufficient as a fully complete end-to-end article feature without gaps.

The strongest parts are backend layering and route coverage. Repositories are mostly query-only, services hold business rules, and controllers remain thin. The weakest parts are input ambiguity in the task definition, frontend coverage gaps around pagination and auth-aware interactions, and some contract/performance risks.

Verdict: the implementation is usable, but not complete enough to call the article feature fully ready end to end.

## Missing Items

1. The task inputs are ambiguous. `prompt/ikp-task1~3.xml` describes foundation, database, and auth setup, not an article-feature breakdown matching Task 28's stated evaluation scope.
2. Comment pagination exists in the backend API, but the frontend comment UI does not expose pagination controls or load-more behavior.
3. Comment sorting and filtering behavior are not exposed in the frontend and are not configurable in the API contract.
4. Frontend article interactions still rely on component-local request logic instead of a dedicated article interaction layer.
5. Versions are implemented for author studio flows, but the end-to-end article feature is still split between public article detail and separate studio-only management behavior.
6. Bookmark and reaction UI do not provide strong unauthenticated affordances before action; they fail only after action attempts.
7. Backend and frontend DTO contracts are duplicated manually instead of being shared, which increases drift risk.

## Issues By Area

### Backend

1. Backend repository and service coverage is strong for article detail, comments, helpfulness, reactions, stats, bookmarks, and versions.
2. Separation of concerns is mostly correct: repositories are query-focused, services contain validation and business rules, and controllers orchestrate request and response flow.
3. A notable performance concern exists in draft loading: the studio loads draft list items and then fetches article detail per draft, creating an N+1 pattern.
4. Article view tracking is handled in memory, which works for local development but is not durable or horizontally scalable.

### API

1. Route coverage is strong: article detail, list, comment create/list/delete, helpfulness read/write, reactions read/write, stats, bookmarks, and versions are exposed.
2. Request and response structures are generally explicit through DTOs, but the contracts are mirrored separately on backend and frontend.
3. API completeness for public article reading is good, but comment pagination is only partially realized because the frontend does not consume the pagination contract.
4. There is no dedicated endpoint for a single-article bookmark state check; the frontend currently fetches the whole bookmark list and filters client-side.

### Frontend

1. Public article detail rendering is well covered for loading, not-found, unavailable, stats, helpfulness, reactions, bookmarks, and comments.
2. Archive pages also cover loading, empty, and error states reasonably well.
3. Comment UI lacks pagination controls despite backend support.
4. Auth-aware behaviors are inconsistent across widgets: helpfulness gives a clear login path, while bookmark and reaction flows depend more on failed requests and inline error messages.
5. UI components are modular, but some contain both rendering and request/session logic, which weakens the stated separation-of-concerns goal.

## Recommendations And Additional Subtasks

1. Clarify the source tasks being evaluated for Task 28, because the referenced `prompt/ikp-task1~3.xml` does not match the described article-feature scope.
2. Add comment pagination UI using the existing `pagination` payload from `GET /articles/:articleId/comments`.
3. Add a small frontend article interaction layer to move request/auth/session handling out of components like comments, helpfulness, reactions, and bookmarks.
4. Add explicit unauthenticated UI behavior for reactions and bookmarks, similar to the helpfulness login prompt.
5. Introduce a lightweight single-article bookmark-state endpoint or batch article engagement state endpoint to avoid overfetching bookmark lists.
6. Reduce draft studio N+1 loading by returning the required author draft data in one backend response.
7. Consider sharing DTO definitions or generating typed contracts to reduce backend/frontend drift.
8. If versions are part of the required article feature scope, explicitly define whether they belong only to author studio or must also appear in broader article-management flows.

## Final Readiness Status

Not Ready

Reason: the backend is close to feature-complete, but the overall article feature still has frontend coverage gaps, contract ambiguity, and task-input mismatch that prevent a clean end-to-end readiness call.