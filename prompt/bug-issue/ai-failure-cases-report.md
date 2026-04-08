# 5. AI Failure Cases

| Issue | Cause (root cause) | How Detected | Resolution |
| --- | --- | --- | --- |
| Misread Bookmark/Add Tag UI context | AI confirmed feature from code/history before locking the exact route and auth state | User said the feature was not visible and browser snapshots did not match the description | Re-checked the correct route `/articles/[articleId]`, revalidated with author context, and clarified UI location |
| Active button bug not fixed at the real source | AI fixed article-detail active states first, while the real issue was header nav active logic | User sent header HTML showing `Open archive` still looked active on `/bookmarks` | Added route-aware active logic for header navigation |
| New helper modules broke frontend build | AI introduced new helper files in a fragile Turbopack/HMR state | Dev server and browser console showed repeated `Module not found` errors | Removed the new helper modules and inlined the logic back into stable files |
| Bug file numbering was inconsistent | AI created bug 5 and bug 6 without checking existing numbering convention | User asked where bug 3 and bug 4 were | Checked history, confirmed they did not exist, then renamed bug 5 and bug 6 to bug 3 and bug 4 |
| Browser review state drift after restart | AI relied on code state while browser auth/session had reset | Browser reloaded to `Log in` and user still could not review the expected UI | Re-authenticated, reloaded the correct route, and separated code validation from review-state validation |