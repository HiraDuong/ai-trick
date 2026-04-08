# Task 35 UI Bug Report

## Coverage

- Browser validation executed in the integrated browser against live frontend and backend services.
- Roles exercised: anonymous user, AUTHOR, EDITOR.
- Pages exercised directly: `/`, `/login`, `/studio`, `/articles`, `/articles/ut_skip_beyond_article_2`, `/articles/ut_skip_beyond_article_3`, `/bookmarks`, `/search?q=Skip+beyond`.
- Interactive elements exercised directly: header search, login form, logout flow, notification bell, draft studio actions, bookmark button, helpfulness buttons, reaction buttons, comment create, reply, delete, bookmarks list link, archive links, search results links.
- Coverage gap: `/tags/[tagId]` was not directly exercised because the visible test articles used during validation did not expose tag links in the rendered UI.

## Overall UI Health Status

The core UI flows are stable after the fixes in this task. Studio authoring, article engagement, bookmarks, search, notifications, login redirect behavior, and editor access all behaved correctly in the final validation pass. No unresolved critical UI-breaking issue remained at the end of testing.

## Critical Issues Requiring Fixes

- None remain unresolved.
- The high-severity issues found during Task 35 were fixed in this changeset.

## Bug Report By Category

### Buttons

No remaining non-functional button issues were observed after the fixes. Bookmark, reaction, helpfulness, comment, notification, studio, and navigation controls all responded correctly in the final pass.

### Inputs

#### Bug 1: Authenticated empty-comments state used anonymous guidance

- Title: Authenticated users were told to log in in the empty comments state.
- Description: The article comments card showed anonymous-only guidance even when the user was already authenticated.
- Steps to reproduce:
  1. Log in.
  2. Open an article with zero comments.
  3. Inspect the empty comments state.
- Expected result: Authenticated users should see a prompt to start the discussion.
- Actual result: The UI showed `No comments yet. Log in to start the discussion.`.
- Severity: Low.
- Affected component/page: `ArticleCommentsCard` on article detail pages.
- Screenshots or logs: Observed on `/articles/ut_skip_beyond_article_2` before the fix.

### Forms

#### Bug 2: Anonymous comment form exposed a submit-ready flow that could only fail on submit

- Title: Comment form did not align its enabled state with authentication.
- Description: Anonymous users could focus the comment box and work toward a submit action even though the action required authentication.
- Steps to reproduce:
  1. Log out.
  2. Open an article detail page.
  3. Inspect the comment form and reply affordances.
- Expected result: The form should clearly reflect that login is required before posting or replying.
- Actual result: The pre-fix UI allowed anonymous interaction deeper into the form flow than it should have.
- Severity: Medium.
- Affected component/page: `ArticleCommentsCard` on article detail pages.
- Screenshots or logs: Final fix disables posting for anonymous users and updates placeholders/helper copy.

### Conditional UI

#### Bug 3: Fresh authenticated tabs rendered logged-out client chrome and triggered hydration mismatch

- Title: Client auth state diverged from server auth state in fresh tabs.
- Description: Server-side route guards could authorize a page from the auth cookie while client widgets still considered the visitor logged out because they only read `localStorage` on the client. The notification bell also read token state during render, which caused hydration mismatch noise.
- Steps to reproduce:
  1. Log in.
  2. Open a fresh tab directly on `/studio` or another protected flow.
  3. Observe the header before client auth state settles.
- Expected result: Client auth chrome should reconcile cleanly with the server-authorized session.
- Actual result: The server delivered the protected page, but the client header initially rendered logged-out UI and the browser reported a hydration mismatch.
- Severity: High.
- Affected component/page: Header auth controls and notification bell across protected pages.
- Screenshots or logs:
  - `Error: Hydration failed because the server rendered HTML didn't match the client.`
  - The mismatch pointed at the notification bell and logged-in header actions.

### API-driven UI

#### Bug 4: Draft studio leaked request loops and could exhaust browser resources

- Title: Studio draft loading logic caused repeated API traffic and `net::ERR_INSUFFICIENT_RESOURCES`.
- Description: The draft studio mixed `useEffectEvent` with mount effects and event handlers in a way that allowed the draft-loading flow to spin repeatedly. During route changes this produced heavy repeated requests against `/auth/me`, `/articles?status=DRAFT...`, article detail, and versions endpoints.
- Steps to reproduce:
  1. Log in and open `/studio`.
  2. Create or load a draft.
  3. Navigate to an article detail page.
  4. Observe the browser console/network events.
- Expected result: Studio requests should stop once the page changes, and article detail should load normally.
- Actual result: The browser emitted repeated request failures and eventually reported `net::ERR_INSUFFICIENT_RESOURCES`.
- Severity: High.
- Affected component/page: `DraftStudio` on `/studio`.
- Screenshots or logs:
  - `GET request to http://localhost:5000/api/articles?status=DRAFT&skip=0&limit=50 failed: net::ERR_INSUFFICIENT_RESOURCES`
  - Repeated failures also hit `/auth/me`, `/articles/:id`, and `/articles/:id/versions`.

#### Bug 5: Bookmark button overfetched account state for a single article

- Title: Bookmark state lookup fetched the full bookmark collection per button instance.
- Description: The article bookmark button loaded `/bookmarks` and filtered client-side instead of using the dedicated per-article bookmark-status endpoint.
- Steps to reproduce:
  1. Review the bookmark button behavior on article detail.
  2. Compare its request pattern with the available backend bookmark-status contract.
- Expected result: The button should fetch only the state required for the current article.
- Actual result: The pre-fix implementation fetched the full bookmark list.
- Severity: Medium.
- Affected component/page: `ArticleBookmarkButton` on article detail pages.
- Screenshots or logs: Confirmed in source review and fixed to call `/articles/:articleId/bookmark-status`.

## Final Result

- No unresolved critical issues remain.
- High-severity issues were fixed in the frontend code during Task 35.
- Residual low-risk gap: direct `/tags/[tagId]` interaction was not revalidated in-browser during this task because the rendered test articles used here did not expose tag chips.