--
-- PostgreSQL database dump
--

\restrict LLa0tuiI18la6PEA5lQ24ZuB0gSyVf2uxEnXLOv4m4uvRk7uESSOLFzaDM4WPW2

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public."Category" DISABLE TRIGGER ALL;

INSERT INTO public."Category" VALUES ('task34_category', 'Task 34 Category', 'Category for Task 34 RBAC validation', NULL, '2026-04-08 15:33:01.213', '2026-04-08 15:33:01.213');
INSERT INTO public."Category" VALUES ('cmnq968pd0004vkufilkdy24t', 'Engineering Playbooks', 'Seeded category for article engagement verification flows.', NULL, '2026-04-08 16:18:52.177', '2026-04-08 16:19:28.708');
INSERT INTO public."Category" VALUES ('cmnric3470006kcufcj3e1izi', 'Engineering', 'Software engineering practices and patterns', NULL, '2026-04-09 13:23:07.591', '2026-04-09 13:23:07.591');
INSERT INTO public."Category" VALUES ('cmnric34g0007kcufvjhqfazu', 'Backend', 'Server-side development', 'cmnric3470006kcufcj3e1izi', '2026-04-09 13:23:07.6', '2026-04-09 13:23:07.6');
INSERT INTO public."Category" VALUES ('cmnric34m0008kcufrdk8x0kc', 'Frontend', 'Client-side development', 'cmnric3470006kcufcj3e1izi', '2026-04-09 13:23:07.606', '2026-04-09 13:23:07.606');
INSERT INTO public."Category" VALUES ('cmnric34p0009kcuf6518lhz1', 'DevOps', 'Infrastructure and CI/CD', 'cmnric3470006kcufcj3e1izi', '2026-04-09 13:23:07.609', '2026-04-09 13:23:07.609');
INSERT INTO public."Category" VALUES ('cmnric34v000akcufjjxfynir', 'Product', 'Product management and design', NULL, '2026-04-09 13:23:07.615', '2026-04-09 13:23:07.615');
INSERT INTO public."Category" VALUES ('cmnric34y000bkcufv3dj8tcm', 'UX Design', 'User experience design', 'cmnric34v000akcufjjxfynir', '2026-04-09 13:23:07.618', '2026-04-09 13:23:07.618');
INSERT INTO public."Category" VALUES ('cmnric351000ckcufqo0eqnx3', 'Analytics', 'Data-driven product decisions', 'cmnric34v000akcufjjxfynir', '2026-04-09 13:23:07.621', '2026-04-09 13:23:07.621');
INSERT INTO public."Category" VALUES ('cmnric355000dkcuf7ygoibqw', 'Process', 'Team processes and workflows', NULL, '2026-04-09 13:23:07.625', '2026-04-09 13:23:07.625');
INSERT INTO public."Category" VALUES ('cmnric358000ekcufu46otgzg', 'Onboarding', 'New member onboarding guides', 'cmnric355000dkcuf7ygoibqw', '2026-04-09 13:23:07.628', '2026-04-09 13:23:07.628');
INSERT INTO public."Category" VALUES ('cmnric35c000fkcuf9e9bmsws', 'Code Review', 'Review standards and checklists', 'cmnric355000dkcuf7ygoibqw', '2026-04-09 13:23:07.632', '2026-04-09 13:23:07.632');


ALTER TABLE public."Category" ENABLE TRIGGER ALL;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."User" DISABLE TRIGGER ALL;

INSERT INTO public."User" VALUES ('task34_author_owner', 'Task 34 Author Owner', 'task34.author.owner@example.com', '$2b$10$FeVsD1LtTwUhbVa0eN1AXe96fEPCS5l/WvmzXfRziYdr2wkBLHCYS', 'AUTHOR', '2026-04-08 15:33:01.199', '2026-04-08 15:33:01.199');
INSERT INTO public."User" VALUES ('task34_author_peer', 'Task 34 Author Peer', 'task34.author.peer@example.com', '$2b$10$FeVsD1LtTwUhbVa0eN1AXe96fEPCS5l/WvmzXfRziYdr2wkBLHCYS', 'AUTHOR', '2026-04-08 15:33:01.199', '2026-04-08 15:33:01.199');
INSERT INTO public."User" VALUES ('task34_editor', 'Task 34 Editor', 'task34.editor@example.com', '$2b$10$FeVsD1LtTwUhbVa0eN1AXe96fEPCS5l/WvmzXfRziYdr2wkBLHCYS', 'EDITOR', '2026-04-08 15:33:01.199', '2026-04-08 15:33:01.199');
INSERT INTO public."User" VALUES ('task34_viewer', 'Task 34 Viewer', 'task34.viewer@example.com', '$2b$10$FeVsD1LtTwUhbVa0eN1AXe96fEPCS5l/WvmzXfRziYdr2wkBLHCYS', 'VIEWER', '2026-04-08 15:33:01.199', '2026-04-08 15:33:01.199');
INSERT INTO public."User" VALUES ('cmnq93qb90000z0uf8fhpsk71', 'Vu Huy Hoang', 'vuhuyhoang@luvnia.net', '$2b$10$bOn4YFqeWvuGvnZtei8R5.wxWfkq80g2Um1RFGzFBmr.Sk17fxoMW', 'AUTHOR', '2026-04-08 16:16:55.029', '2026-04-08 16:16:55.029');
INSERT INTO public."User" VALUES ('cmnq968nl0001vkuf7u7ra66p', 'Seed Reviewer One', 'seed.reviewer1@ikp.local', '$2b$10$PSIhEvaBYvJdWbp9irXFO.fxQlkkC..qcAg8Gc2fyWHhpSCpDdOw2', 'VIEWER', '2026-04-08 16:18:52.115', '2026-04-08 16:19:28.65');
INSERT INTO public."User" VALUES ('cmnq968nm0003vkufwde2kbas', 'Seed Reviewer Three', 'seed.reviewer3@ikp.local', '$2b$10$PSIhEvaBYvJdWbp9irXFO.fxQlkkC..qcAg8Gc2fyWHhpSCpDdOw2', 'VIEWER', '2026-04-08 16:18:52.115', '2026-04-08 16:19:28.65');
INSERT INTO public."User" VALUES ('cmnq968nl0002vkufyosjz6ig', 'Seed Reviewer Two', 'seed.reviewer2@ikp.local', '$2b$10$PSIhEvaBYvJdWbp9irXFO.fxQlkkC..qcAg8Gc2fyWHhpSCpDdOw2', 'VIEWER', '2026-04-08 16:18:52.115', '2026-04-08 16:19:28.65');
INSERT INTO public."User" VALUES ('cmnq968nk0000vkuf3vehzp5a', 'Seed Author', 'seed.author@ikp.local', '$2b$10$PSIhEvaBYvJdWbp9irXFO.fxQlkkC..qcAg8Gc2fyWHhpSCpDdOw2', 'AUTHOR', '2026-04-08 16:18:52.114', '2026-04-08 16:19:28.649');
INSERT INTO public."User" VALUES ('cmnribnhn0002qwufkjmnqg3s', 'Tran Duc Phong', 'author2@ikp.dev', '$2b$10$8zlxbecN283gYJTJiDQZXO0FwxLhy2aYvVDl0l.2.4.jcmehyfwQ6', 'AUTHOR', '2026-04-09 13:22:47.341', '2026-04-09 13:23:07.507');
INSERT INTO public."User" VALUES ('cmnribnho0005qwufxxodjn0b', 'Do Ngoc Mai', 'viewer2@ikp.dev', '$2b$10$8zlxbecN283gYJTJiDQZXO0FwxLhy2aYvVDl0l.2.4.jcmehyfwQ6', 'VIEWER', '2026-04-09 13:22:47.341', '2026-04-09 13:23:07.507');
INSERT INTO public."User" VALUES ('cmnribnhn0001qwuf33ofv0mu', 'Nguyen Minh Anh', 'author1@ikp.dev', '$2b$10$8zlxbecN283gYJTJiDQZXO0FwxLhy2aYvVDl0l.2.4.jcmehyfwQ6', 'AUTHOR', '2026-04-09 13:22:47.341', '2026-04-09 13:23:07.507');
INSERT INTO public."User" VALUES ('cmnribnhn0003qwuf43ov5u7g', 'Le Thi Thanh', 'author3@ikp.dev', '$2b$10$8zlxbecN283gYJTJiDQZXO0FwxLhy2aYvVDl0l.2.4.jcmehyfwQ6', 'AUTHOR', '2026-04-09 13:22:47.341', '2026-04-09 13:23:07.507');
INSERT INTO public."User" VALUES ('cmnribnhm0000qwufda93e7tk', 'Hoang Vu', 'admin@ikp.dev', '$2b$10$8zlxbecN283gYJTJiDQZXO0FwxLhy2aYvVDl0l.2.4.jcmehyfwQ6', 'EDITOR', '2026-04-09 13:22:47.34', '2026-04-09 13:23:07.507');
INSERT INTO public."User" VALUES ('cmnribnho0004qwuf28qyoel7', 'Pham Quang Huy', 'viewer1@ikp.dev', '$2b$10$8zlxbecN283gYJTJiDQZXO0FwxLhy2aYvVDl0l.2.4.jcmehyfwQ6', 'VIEWER', '2026-04-09 13:22:47.341', '2026-04-09 13:23:07.507');


ALTER TABLE public."User" ENABLE TRIGGER ALL;

--
-- Data for Name: Article; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Article" DISABLE TRIGGER ALL;

INSERT INTO public."Article" VALUES ('task34_owner_draft', 'Owner Draft', '["Owner draft content"]', 'DRAFT', 0, 'task34_author_owner', 'task34_category', '2026-04-08 15:33:01.223', '2026-04-08 15:33:01.223', NULL);
INSERT INTO public."Article" VALUES ('task34_peer_update_draft', 'Editor updated draft', '["Peer update draft content"]', 'DRAFT', 0, 'task34_author_peer', 'task34_category', '2026-04-08 15:33:01.223', '2026-04-08 15:33:01.669', NULL);
INSERT INTO public."Article" VALUES ('task34_peer_restore_draft', 'Peer Restore Draft', '["Restore target content"]', 'DRAFT', 0, 'task34_author_peer', 'task34_category', '2026-04-08 15:33:01.223', '2026-04-08 15:33:01.739', NULL);
INSERT INTO public."Article" VALUES ('cmnric394000wkcufbbl1qvdm', 'Prisma Migration Strategies for Production', '[{"text": "Migration lifecycle", "type": "heading"}, {"text": "Prisma migrations track schema changes as sequential SQL files. Each migration is immutable once created and should be reviewed before merging to the main branch.", "type": "paragraph"}, {"text": "Deploying safely", "type": "heading"}, {"text": "Use prisma migrate deploy in production instead of prisma migrate dev. The deploy command applies pending migrations without generating new ones, making it safe for automated pipelines.", "type": "paragraph"}, {"text": "Handling breaking changes", "type": "heading"}, {"text": "When renaming columns or changing types, create a multi-step migration: add the new column, backfill data, then remove the old column in a subsequent migration.", "type": "paragraph"}]', 'PUBLISHED', 218, 'cmnribnhn0001qwuf33ofv0mu', 'cmnric34g0007kcufvjhqfazu', '2026-04-09 13:23:07.768', '2026-04-09 13:23:07.768', '2026-04-09 13:23:07.767');
INSERT INTO public."Article" VALUES ('cmnric39e000xkcuf1ucu6hkg', 'Building Responsive UIs with Next.js App Router', '[{"text": "App Router fundamentals", "type": "heading"}, {"text": "Next.js App Router uses file-system based routing with support for layouts, loading states, and error boundaries. Server Components are the default, reducing client-side JavaScript bundle size.", "type": "paragraph"}, {"text": "Data fetching patterns", "type": "heading"}, {"text": "Fetch data in Server Components using async/await directly. For client-side interactivity, use Client Components with React hooks and SWR or React Query for cache management.", "type": "paragraph"}, {"text": "Responsive design", "type": "heading"}, {"text": "Use CSS Grid and Flexbox with Tailwind utility classes for responsive layouts. Design mobile-first and progressively enhance for larger viewports.", "type": "paragraph"}]', 'PUBLISHED', 456, 'cmnribnhn0002qwufkjmnqg3s', 'cmnric34m0008kcufrdk8x0kc', '2026-04-09 13:23:07.778', '2026-04-09 13:23:07.778', '2026-04-09 13:23:07.778');
INSERT INTO public."Article" VALUES ('cmnq968qm000bvkufxs24najl', 'Launching article feedback from zero', '[{"text": "Testing the empty engagement state", "type": "heading"}, {"text": "This published article intentionally starts with zero helpfulness votes so the UI can be reviewed in its empty state without changing code or database records manually.", "type": "paragraph"}]', 'PUBLISHED', 14, 'cmnq968nk0000vkuf3vehzp5a', 'cmnq968pd0004vkufilkdy24t', '2026-04-08 16:18:52.222', '2026-04-08 17:36:43.059', '2026-04-08 09:00:00');
INSERT INTO public."Article" VALUES ('cmnric39o000ykcufpkcs87fx', 'Docker Multi-Stage Builds for Node.js', '[{"text": "Why multi-stage builds?", "type": "heading"}, {"text": "Multi-stage builds reduce final image size by separating build dependencies from runtime dependencies. A typical Node.js app can go from 1GB to under 200MB with proper staging.", "type": "paragraph"}, {"text": "Stage design", "type": "heading"}, {"text": "Use three stages: base (OS + system deps), builder (npm install + build), and runner (production node_modules + compiled output). Each stage starts fresh from the base image.", "type": "paragraph"}, {"text": "Security considerations", "type": "heading"}, {"text": "Run the final container as a non-root user. Copy only the files needed at runtime. Use npm ci instead of npm install for deterministic builds.", "type": "paragraph"}]', 'PUBLISHED', 189, 'cmnribnhn0002qwufkjmnqg3s', 'cmnric34p0009kcuf6518lhz1', '2026-04-09 13:23:07.788', '2026-04-09 13:23:07.788', '2026-04-09 13:23:07.788');
INSERT INTO public."Article" VALUES ('cmnq9ff8z0009k0ufndzf9jt8', 'Untitled draft', '["Start writing here."]', 'DRAFT', 0, 'cmnq968nk0000vkuf3vehzp5a', 'cmnq968pd0004vkufilkdy24t', '2026-04-08 16:26:00.563', '2026-04-08 16:26:00.563', NULL);
INSERT INTO public."Article" VALUES ('cmnq9jnfs000bk0ufd11mhjtt', 'ass', '"<p><strong>aaaaaaaaaaaaaaaaaaa</strong></p><p><strong><em>dddddddddddddd</em></strong></p>"', 'PUBLISHED', 4, 'cmnq93qb90000z0uf8fhpsk71', 'task34_category', '2026-04-08 16:29:17.8', '2026-04-08 17:38:34.898', '2026-04-08 16:43:26.274');
INSERT INTO public."Article" VALUES ('task34_peer_publish_draft', 'Peer Publish Draft', '["Peer publish draft content"]', 'PUBLISHED', 2, 'task34_author_peer', 'task34_category', '2026-04-08 15:33:01.223', '2026-04-08 17:39:09.317', '2026-04-08 15:33:01.699');
INSERT INTO public."Article" VALUES ('cmnqa00eg0000s0ufaj2i20yr', 'Delete version validation draft', '["Version three"]', 'PUBLISHED', 2, 'cmnq968nk0000vkuf3vehzp5a', 'cmnq968pd0004vkufilkdy24t', '2026-04-08 16:42:01.096', '2026-04-08 17:47:29.387', '2026-04-08 17:14:38.794');
INSERT INTO public."Article" VALUES ('task34_published_article', 'Published Article', '["Published content"]', 'PUBLISHED', 2, 'task34_author_peer', 'task34_category', '2026-04-08 15:33:01.223', '2026-04-08 17:49:49.961', '2026-04-08 12:00:00');
INSERT INTO public."Article" VALUES ('cmnq9sc7q0000ugufuyux86rm', 'Restore validation draft', '["Version one"]', 'DRAFT', 0, 'cmnq968nk0000vkuf3vehzp5a', 'cmnq968pd0004vkufilkdy24t', '2026-04-08 16:36:03.159', '2026-04-08 16:36:03.245', NULL);
INSERT INTO public."Article" VALUES ('cmnq968q7000avkuftqjpi29v', 'Building a reliable knowledge-sharing workflow', '[{"text": "Why this article exists", "type": "heading"}, {"text": "Teams need a repeatable path from project delivery to reusable internal knowledge. This seeded article is used to verify public article rendering, comments, and helpfulness voting end to end.", "type": "paragraph"}, {"text": "Recommended workflow", "type": "heading"}, {"type": "bulletList", "content": [{"text": "Capture the implementation decisions while context is still fresh."}, {"text": "Publish one concise article before expanding into long-form documentation."}, {"text": "Track reader feedback to learn whether the article is actually useful."}]}, {"text": "Knowledge compounds only when the next team can find it, trust it, and improve it.", "type": "quote"}]', 'PUBLISHED', 186, 'cmnq968nk0000vkuf3vehzp5a', 'cmnq968pd0004vkufilkdy24t', '2026-04-08 16:18:52.207', '2026-04-08 17:13:07.216', '2026-04-08 09:00:00');
INSERT INTO public."Article" VALUES ('cmnric38e000vkcufp6ivk59e', 'Getting Started with Express and TypeScript', '[{"text": "Why TypeScript for Express?", "type": "heading"}, {"text": "TypeScript adds static type safety to Express applications, catching errors at compile time instead of runtime. This is especially valuable in large codebases where multiple developers contribute to the same API surface.", "type": "paragraph"}, {"text": "Project setup", "type": "heading"}, {"text": "Start with a tsconfig.json that targets ES2020 and uses strict mode. Install @types/express alongside express. Use ts-node for development and tsc for production builds.", "type": "paragraph"}, {"text": "Structuring routes", "type": "heading"}, {"text": "Organize routes by resource using Express Router. Each router module exports a configured Router instance that the main app mounts at a specific path prefix.", "type": "paragraph"}, {"text": "Error handling", "type": "heading"}, {"text": "Create a centralized error handler middleware that catches both synchronous exceptions and rejected promises. Return consistent JSON error responses with appropriate HTTP status codes.", "type": "paragraph"}]', 'PUBLISHED', 342, 'cmnribnhn0001qwuf33ofv0mu', 'cmnric34g0007kcufvjhqfazu', '2026-04-09 13:23:07.742', '2026-04-09 13:23:07.742', '2026-04-09 13:23:07.74');
INSERT INTO public."Article" VALUES ('cmnric39x000zkcuf7cd7652r', 'GitLab CI/CD Pipeline for Monorepos', '[{"text": "Pipeline structure", "type": "heading"}, {"text": "Organize pipeline stages as install, build, test, docker, and deploy. Use needs to create a directed acyclic graph where independent jobs run in parallel.", "type": "paragraph"}, {"text": "Caching strategy", "type": "heading"}, {"text": "Cache node_modules based on package-lock.json hash. Use artifact passing between stages for build outputs instead of rebuilding in each job.", "type": "paragraph"}, {"text": "Deployment to Cloud Run", "type": "heading"}, {"text": "Build container images with Kaniko in the docker stage. Deploy using gcloud run deploy with environment variables injected from GitLab CI/CD variables.", "type": "paragraph"}]', 'PUBLISHED', 312, 'cmnribnhm0000qwufda93e7tk', 'cmnric34p0009kcuf6518lhz1', '2026-04-09 13:23:07.797', '2026-04-09 13:23:07.797', '2026-04-09 13:23:07.797');
INSERT INTO public."Article" VALUES ('cmnric3a60010kcufvadzibdl', 'API Security Best Practices', '[{"text": "Authentication vs Authorization", "type": "heading"}, {"text": "Authentication verifies identity (who are you?). Authorization checks permissions (what can you do?). Implement both as separate middleware layers in Express.", "type": "paragraph"}, {"text": "JWT handling", "type": "heading"}, {"text": "Store JWT secrets in environment variables, never in code. Set reasonable expiration times. Validate tokens on every request using middleware before route handlers.", "type": "paragraph"}, {"text": "Input validation", "type": "heading"}, {"text": "Validate and sanitize all user input at the API boundary. Use schema validation libraries to enforce expected types, lengths, and formats before processing.", "type": "paragraph"}]', 'PUBLISHED', 275, 'cmnribnhn0003qwuf43ov5u7g', 'cmnric34g0007kcufvjhqfazu', '2026-04-09 13:23:07.806', '2026-04-09 13:23:07.806', '2026-04-09 13:23:07.806');
INSERT INTO public."Article" VALUES ('cmnric3af0011kcufkikr4fuf', 'Effective Code Review Guidelines', '[{"text": "Review scope", "type": "heading"}, {"text": "Keep pull requests small and focused. A PR should address one logical change. Large PRs slow down reviews and increase the risk of missing issues.", "type": "paragraph"}, {"text": "What to look for", "type": "heading"}, {"text": "Check for correctness, readability, and maintainability. Verify error handling, edge cases, and alignment with existing patterns. Avoid style nitpicks that should be handled by linters.", "type": "paragraph"}, {"text": "Giving feedback", "type": "heading"}, {"text": "Be specific and constructive. Explain why something should change, not just what. Distinguish between blocking issues and optional suggestions.", "type": "paragraph"}]', 'PUBLISHED', 198, 'cmnribnhm0000qwufda93e7tk', 'cmnric35c000fkcuf9e9bmsws', '2026-04-09 13:23:07.815', '2026-04-09 13:23:07.815', '2026-04-09 13:23:07.814');
INSERT INTO public."Article" VALUES ('cmnric3am0012kcufk039pwng', 'New Developer Onboarding Checklist', '[{"text": "Day 1: Environment setup", "type": "heading"}, {"text": "Clone the monorepo, install Node.js 20, set up Docker, and run the local development stack. Verify that both backend and frontend start without errors.", "type": "paragraph"}, {"text": "Week 1: Codebase walkthrough", "type": "heading"}, {"text": "Read the README, review the architecture document, and pair with a team member on a small bug fix or feature. Submit your first pull request by end of week.", "type": "paragraph"}, {"text": "Month 1: Independence", "type": "heading"}, {"text": "Take ownership of a feature from design through deployment. Participate in code reviews and contribute to internal documentation.", "type": "paragraph"}]', 'PUBLISHED', 421, 'cmnribnhm0000qwufda93e7tk', 'cmnric358000ekcufu46otgzg', '2026-04-09 13:23:07.822', '2026-04-09 13:23:07.822', '2026-04-09 13:23:07.822');
INSERT INTO public."Article" VALUES ('cmnric3aw0013kcufa5z02st0', 'PostgreSQL Performance Tuning Basics', '[{"text": "Indexing strategy", "type": "heading"}, {"text": "Create indexes on columns used in WHERE clauses, JOIN conditions, and ORDER BY. Use composite indexes for queries that filter on multiple columns together. Monitor unused indexes periodically.", "type": "paragraph"}, {"text": "Query analysis", "type": "heading"}, {"text": "Use EXPLAIN ANALYZE to understand query execution plans. Look for sequential scans on large tables, nested loop joins, and high row estimates that differ from actual counts.", "type": "paragraph"}, {"text": "Connection pooling", "type": "heading"}, {"text": "Use PgBouncer or application-level pooling to limit the number of database connections. Each PostgreSQL connection consumes memory, so fewer persistent connections is better.", "type": "paragraph"}]', 'PUBLISHED', 167, 'cmnribnhn0003qwuf43ov5u7g', 'cmnric34g0007kcufvjhqfazu', '2026-04-09 13:23:07.832', '2026-04-09 13:23:07.832', '2026-04-09 13:23:07.832');
INSERT INTO public."Article" VALUES ('cmnric3b60014kcufa1lcxotb', 'UX Research Methods for Internal Tools', '[{"text": "Why research internal tools?", "type": "heading"}, {"text": "Internal tools serve a captive audience, but poor usability still costs time and productivity. Quick user interviews and task observations reveal friction points that developers tolerate but shouldn''t have to.", "type": "paragraph"}, {"text": "Lightweight methods", "type": "heading"}, {"text": "Run 15-minute corridor tests with colleagues. Use screen recordings of real workflows to identify confusion. Track most-used and least-used features through analytics.", "type": "paragraph"}, {"text": "Applying findings", "type": "heading"}, {"text": "Prioritize fixes by frequency and severity. Small changes like clearer labels or fewer clicks often deliver more value than feature additions.", "type": "paragraph"}]', 'PUBLISHED', 93, 'cmnribnhn0002qwufkjmnqg3s', 'cmnric34y000bkcufv3dj8tcm', '2026-04-09 13:23:07.842', '2026-04-09 13:23:07.842', '2026-04-09 13:23:07.842');
INSERT INTO public."Article" VALUES ('cmnric3bf0015kcufyc8fjc67', 'Testing Strategy for Full-Stack Apps (Draft)', '[{"text": "Test pyramid", "type": "heading"}, {"text": "Write many unit tests, fewer integration tests, and a small number of end-to-end tests. Each layer provides different confidence and has different maintenance costs.", "type": "paragraph"}, {"text": "Backend testing", "type": "heading"}, {"text": "Test service layer logic with unit tests. Test API endpoints with integration tests against a real database. Use test fixtures that are independent and repeatable.", "type": "paragraph"}]', 'DRAFT', 15, 'cmnribnhn0001qwuf33ofv0mu', 'cmnric34g0007kcufvjhqfazu', '2026-04-09 13:23:07.851', '2026-04-09 13:23:07.851', NULL);


ALTER TABLE public."Article" ENABLE TRIGGER ALL;

--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Tag" DISABLE TRIGGER ALL;

INSERT INTO public."Tag" VALUES ('cmnq968po0005vkuf3uujn793', 'knowledge-base', '2026-04-08 16:18:52.188', '2026-04-08 16:18:52.188');
INSERT INTO public."Tag" VALUES ('cmnq968po0006vkufq19fiv43', 'workflow', '2026-04-08 16:18:52.188', '2026-04-08 16:18:52.188');
INSERT INTO public."Tag" VALUES ('cmnq968po0007vkufj44kb5j7', 'engagement', '2026-04-08 16:18:52.189', '2026-04-08 16:18:52.189');
INSERT INTO public."Tag" VALUES ('cmnq968py0008vkufp852y4uo', 'testing', '2026-04-08 16:18:52.198', '2026-04-08 16:18:52.198');
INSERT INTO public."Tag" VALUES ('cmnq968pz0009vkufdbq82zt2', 'empty-state', '2026-04-08 16:18:52.199', '2026-04-08 16:18:52.199');
INSERT INTO public."Tag" VALUES ('cmnqb3k480000qguf197tmypa', 'task37-author-tag', '2026-04-08 17:12:46.232', '2026-04-08 17:12:46.232');
INSERT INTO public."Tag" VALUES ('cmnqb3k4h0001qgufa3aibj20', 'bookmark-ui', '2026-04-08 17:12:46.232', '2026-04-08 17:12:46.232');
INSERT INTO public."Tag" VALUES ('cmnqb6skp0003qguf6g0e3bup', 'live-ui-check', '2026-04-08 17:15:17.158', '2026-04-08 17:15:17.158');
INSERT INTO public."Tag" VALUES ('cmnqckcyg000oqgufp948cnw7', 'sadsaa', '2026-04-08 17:53:49.72', '2026-04-08 17:53:49.72');
INSERT INTO public."Tag" VALUES ('cmnric35p000gkcuf2u7xt4rl', 'nodejs', '2026-04-09 13:23:07.645', '2026-04-09 13:23:07.645');
INSERT INTO public."Tag" VALUES ('cmnric35x000hkcufk9m9jxlm', 'typescript', '2026-04-09 13:23:07.653', '2026-04-09 13:23:07.653');
INSERT INTO public."Tag" VALUES ('cmnric362000ikcufdzs37v2e', 'react', '2026-04-09 13:23:07.658', '2026-04-09 13:23:07.658');
INSERT INTO public."Tag" VALUES ('cmnric367000jkcufsra62pyy', 'nextjs', '2026-04-09 13:23:07.663', '2026-04-09 13:23:07.663');
INSERT INTO public."Tag" VALUES ('cmnric36e000kkcuf0zn7cimo', 'prisma', '2026-04-09 13:23:07.67', '2026-04-09 13:23:07.67');
INSERT INTO public."Tag" VALUES ('cmnric36k000lkcufiqmzpazd', 'postgresql', '2026-04-09 13:23:07.676', '2026-04-09 13:23:07.676');
INSERT INTO public."Tag" VALUES ('cmnric36q000mkcufhh0bcd8z', 'docker', '2026-04-09 13:23:07.682', '2026-04-09 13:23:07.682');
INSERT INTO public."Tag" VALUES ('cmnric36v000nkcuff6hpk5ct', 'cloud-run', '2026-04-09 13:23:07.687', '2026-04-09 13:23:07.687');
INSERT INTO public."Tag" VALUES ('cmnric36z000okcuf5mg631b6', 'ci-cd', '2026-04-09 13:23:07.692', '2026-04-09 13:23:07.692');
INSERT INTO public."Tag" VALUES ('cmnric37b000pkcufbngex5zt', 'api-design', '2026-04-09 13:23:07.703', '2026-04-09 13:23:07.703');
INSERT INTO public."Tag" VALUES ('cmnric37g000qkcufbp5c07v0', 'security', '2026-04-09 13:23:07.708', '2026-04-09 13:23:07.708');
INSERT INTO public."Tag" VALUES ('cmnric37m000rkcufehkqr0tz', 'performance', '2026-04-09 13:23:07.714', '2026-04-09 13:23:07.714');
INSERT INTO public."Tag" VALUES ('cmnric37r000skcufk2uxbaxo', 'architecture', '2026-04-09 13:23:07.719', '2026-04-09 13:23:07.719');
INSERT INTO public."Tag" VALUES ('cmnric37v000tkcuf6fbcekq1', 'agile', '2026-04-09 13:23:07.723', '2026-04-09 13:23:07.723');
INSERT INTO public."Tag" VALUES ('cmnric383000ukcufqgzm6u6o', 'best-practices', '2026-04-09 13:23:07.731', '2026-04-09 13:23:07.731');


ALTER TABLE public."Tag" ENABLE TRIGGER ALL;

--
-- Data for Name: ArticleTag; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ArticleTag" DISABLE TRIGGER ALL;

INSERT INTO public."ArticleTag" VALUES ('cmnq968q7000avkuftqjpi29v', 'cmnq968po0005vkuf3uujn793', '2026-04-08 16:19:28.744');
INSERT INTO public."ArticleTag" VALUES ('cmnq968q7000avkuftqjpi29v', 'cmnq968po0007vkufj44kb5j7', '2026-04-08 16:19:28.744');
INSERT INTO public."ArticleTag" VALUES ('cmnq968q7000avkuftqjpi29v', 'cmnq968po0006vkufq19fiv43', '2026-04-08 16:19:28.744');
INSERT INTO public."ArticleTag" VALUES ('cmnq968qm000bvkufxs24najl', 'cmnq968py0008vkufp852y4uo', '2026-04-08 16:19:28.755');
INSERT INTO public."ArticleTag" VALUES ('cmnq968qm000bvkufxs24najl', 'cmnq968pz0009vkufdbq82zt2', '2026-04-08 16:19:28.755');
INSERT INTO public."ArticleTag" VALUES ('cmnqa00eg0000s0ufaj2i20yr', 'cmnqb3k480000qguf197tmypa', '2026-04-08 17:15:17.158');
INSERT INTO public."ArticleTag" VALUES ('cmnqa00eg0000s0ufaj2i20yr', 'cmnqb6skp0003qguf6g0e3bup', '2026-04-08 17:15:17.158');
INSERT INTO public."ArticleTag" VALUES ('cmnqa00eg0000s0ufaj2i20yr', 'cmnqb3k4h0001qgufa3aibj20', '2026-04-08 17:15:17.158');
INSERT INTO public."ArticleTag" VALUES ('cmnric38e000vkcufp6ivk59e', 'cmnric35p000gkcuf2u7xt4rl', '2026-04-09 13:23:07.76');
INSERT INTO public."ArticleTag" VALUES ('cmnric38e000vkcufp6ivk59e', 'cmnric35x000hkcufk9m9jxlm', '2026-04-09 13:23:07.76');
INSERT INTO public."ArticleTag" VALUES ('cmnric38e000vkcufp6ivk59e', 'cmnric37b000pkcufbngex5zt', '2026-04-09 13:23:07.76');
INSERT INTO public."ArticleTag" VALUES ('cmnric394000wkcufbbl1qvdm', 'cmnric36e000kkcuf0zn7cimo', '2026-04-09 13:23:07.773');
INSERT INTO public."ArticleTag" VALUES ('cmnric394000wkcufbbl1qvdm', 'cmnric36k000lkcufiqmzpazd', '2026-04-09 13:23:07.773');
INSERT INTO public."ArticleTag" VALUES ('cmnric394000wkcufbbl1qvdm', 'cmnric383000ukcufqgzm6u6o', '2026-04-09 13:23:07.773');
INSERT INTO public."ArticleTag" VALUES ('cmnric39e000xkcuf1ucu6hkg', 'cmnric367000jkcufsra62pyy', '2026-04-09 13:23:07.784');
INSERT INTO public."ArticleTag" VALUES ('cmnric39e000xkcuf1ucu6hkg', 'cmnric362000ikcufdzs37v2e', '2026-04-09 13:23:07.784');
INSERT INTO public."ArticleTag" VALUES ('cmnric39e000xkcuf1ucu6hkg', 'cmnric35x000hkcufk9m9jxlm', '2026-04-09 13:23:07.784');
INSERT INTO public."ArticleTag" VALUES ('cmnric39o000ykcufpkcs87fx', 'cmnric36q000mkcufhh0bcd8z', '2026-04-09 13:23:07.793');
INSERT INTO public."ArticleTag" VALUES ('cmnric39o000ykcufpkcs87fx', 'cmnric35p000gkcuf2u7xt4rl', '2026-04-09 13:23:07.793');
INSERT INTO public."ArticleTag" VALUES ('cmnric39o000ykcufpkcs87fx', 'cmnric37m000rkcufehkqr0tz', '2026-04-09 13:23:07.793');
INSERT INTO public."ArticleTag" VALUES ('cmnric39x000zkcuf7cd7652r', 'cmnric36z000okcuf5mg631b6', '2026-04-09 13:23:07.803');
INSERT INTO public."ArticleTag" VALUES ('cmnric39x000zkcuf7cd7652r', 'cmnric36q000mkcufhh0bcd8z', '2026-04-09 13:23:07.803');
INSERT INTO public."ArticleTag" VALUES ('cmnric39x000zkcuf7cd7652r', 'cmnric36v000nkcuff6hpk5ct', '2026-04-09 13:23:07.803');
INSERT INTO public."ArticleTag" VALUES ('cmnric3a60010kcufvadzibdl', 'cmnric37g000qkcufbp5c07v0', '2026-04-09 13:23:07.81');
INSERT INTO public."ArticleTag" VALUES ('cmnric3a60010kcufvadzibdl', 'cmnric37b000pkcufbngex5zt', '2026-04-09 13:23:07.81');
INSERT INTO public."ArticleTag" VALUES ('cmnric3a60010kcufvadzibdl', 'cmnric383000ukcufqgzm6u6o', '2026-04-09 13:23:07.81');
INSERT INTO public."ArticleTag" VALUES ('cmnric3af0011kcufkikr4fuf', 'cmnric383000ukcufqgzm6u6o', '2026-04-09 13:23:07.819');
INSERT INTO public."ArticleTag" VALUES ('cmnric3af0011kcufkikr4fuf', 'cmnric37v000tkcuf6fbcekq1', '2026-04-09 13:23:07.819');
INSERT INTO public."ArticleTag" VALUES ('cmnric3am0012kcufk039pwng', 'cmnric383000ukcufqgzm6u6o', '2026-04-09 13:23:07.826');
INSERT INTO public."ArticleTag" VALUES ('cmnric3am0012kcufk039pwng', 'cmnric37v000tkcuf6fbcekq1', '2026-04-09 13:23:07.826');
INSERT INTO public."ArticleTag" VALUES ('cmnric3aw0013kcufa5z02st0', 'cmnric36k000lkcufiqmzpazd', '2026-04-09 13:23:07.839');
INSERT INTO public."ArticleTag" VALUES ('cmnric3aw0013kcufa5z02st0', 'cmnric37m000rkcufehkqr0tz', '2026-04-09 13:23:07.839');
INSERT INTO public."ArticleTag" VALUES ('cmnric3aw0013kcufa5z02st0', 'cmnric383000ukcufqgzm6u6o', '2026-04-09 13:23:07.839');
INSERT INTO public."ArticleTag" VALUES ('cmnric3b60014kcufa1lcxotb', 'cmnric383000ukcufqgzm6u6o', '2026-04-09 13:23:07.846');
INSERT INTO public."ArticleTag" VALUES ('cmnric3b60014kcufa1lcxotb', 'cmnric37v000tkcuf6fbcekq1', '2026-04-09 13:23:07.846');
INSERT INTO public."ArticleTag" VALUES ('cmnric3bf0015kcufyc8fjc67', 'cmnq968py0008vkufp852y4uo', '2026-04-09 13:23:07.855');
INSERT INTO public."ArticleTag" VALUES ('cmnric3bf0015kcufyc8fjc67', 'cmnric37b000pkcufbngex5zt', '2026-04-09 13:23:07.855');


ALTER TABLE public."ArticleTag" ENABLE TRIGGER ALL;

--
-- Data for Name: ArticleVersion; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ArticleVersion" DISABLE TRIGGER ALL;

INSERT INTO public."ArticleVersion" VALUES ('task34_restore_v1', 'task34_peer_restore_draft', '["Restore target content"]', 'task34_author_peer', '2026-04-08 15:33:01.232');
INSERT INTO public."ArticleVersion" VALUES ('task34_restore_v2', 'task34_peer_restore_draft', '["Current restore draft content"]', 'task34_author_peer', '2026-04-08 15:33:01.232');
INSERT INTO public."ArticleVersion" VALUES ('cmnq9ff9a000ak0ufcksho7ii', 'cmnq9ff8z0009k0ufndzf9jt8', '["Start writing here."]', 'cmnq968nk0000vkuf3vehzp5a', '2026-04-08 16:26:00.574');
INSERT INTO public."ArticleVersion" VALUES ('cmnq9sc810001ugufrdg2vj3v', 'cmnq9sc7q0000ugufuyux86rm', '["Version one"]', 'cmnq968nk0000vkuf3vehzp5a', '2026-04-08 16:36:03.169');
INSERT INTO public."ArticleVersion" VALUES ('cmnq9sc8q0002uguf3gjf69xd', 'cmnq9sc7q0000ugufuyux86rm', '["Version two"]', 'cmnq968nk0000vkuf3vehzp5a', '2026-04-08 16:36:03.194');
INSERT INTO public."ArticleVersion" VALUES ('cmnq9wgim0006ugufrmytzos4', 'cmnq9jnfs000bk0ufd11mhjtt', '"<p><strong>aaaaaaaaaaaaaaaaaaa</strong></p><p><strong><em>dddddddddddddd</em></strong></p>"', 'cmnq93qb90000z0uf8fhpsk71', '2026-04-08 16:39:15.358');
INSERT INTO public."ArticleVersion" VALUES ('cmnqa00fj0002s0ufb3jmnncy', 'cmnqa00eg0000s0ufaj2i20yr', '["Version two"]', 'cmnq968nk0000vkuf3vehzp5a', '2026-04-08 16:42:01.135');


ALTER TABLE public."ArticleVersion" ENABLE TRIGGER ALL;

--
-- Data for Name: ArticleViewSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."ArticleViewSession" DISABLE TRIGGER ALL;

INSERT INTO public."ArticleViewSession" VALUES ('0813555e-5c38-48e9-92c5-979a10759a82', 'cmnq9jnfs000bk0ufd11mhjtt', 'f22d2e2475593de5af06f708689da5441cd51de45f8de9e3160f911f21a00ac3', '2026-04-08 16:38:26.232');
INSERT INTO public."ArticleViewSession" VALUES ('c8945855-fa10-4745-bbd9-fdadfc2412a2', 'cmnq968q7000avkuftqjpi29v', '8cccb0897b1f6fed0ea785f8fc819104c3dff0f3f3e11d6d0943bd1cb2f7a8c9', '2026-04-08 17:13:07.203');
INSERT INTO public."ArticleViewSession" VALUES ('bba99e4b-d979-4d45-996d-012172b4b338', 'cmnq968qm000bvkufxs24najl', '1d6f9725f1b1fb77390632345da62d91a58ba2b78684a36a5e7c6d56d1a38515', '2026-04-08 17:36:43.047');
INSERT INTO public."ArticleViewSession" VALUES ('3bc97db5-5c66-4216-aef5-54cd7c8a4506', 'cmnq9jnfs000bk0ufd11mhjtt', '820d026c3ac2ba1a2c3fd2fab69dd3a4b06b9573400c58fcaab6d68cf38b7a97', '2026-04-08 17:38:34.889');
INSERT INTO public."ArticleViewSession" VALUES ('e4166f24-9088-47de-a367-65608e94444a', 'task34_peer_publish_draft', '22f951eb29f79e2676113094b33e3a6286f3c90e9876ad9d8974ff099eab4601', '2026-04-08 17:39:09.313');
INSERT INTO public."ArticleViewSession" VALUES ('32f424eb-1298-4f09-87e3-d68ad39eca11', 'cmnqa00eg0000s0ufaj2i20yr', '5f0d10c9cd8e7291f2eebf0f14ae7256f64a83ddeaa9dd2d21938b1e11268872', '2026-04-08 17:47:29.381');
INSERT INTO public."ArticleViewSession" VALUES ('d03f25a0-042f-4210-b5ee-09179a9c3b60', 'task34_published_article', 'abce69060d7c9279f053e3801cc1d1755ad2693a74dabadb872373df77eaca39', '2026-04-08 17:49:49.943');


ALTER TABLE public."ArticleViewSession" ENABLE TRIGGER ALL;

--
-- Data for Name: Bookmark; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Bookmark" DISABLE TRIGGER ALL;

INSERT INTO public."Bookmark" VALUES ('cmnqb6i260002qgufp5pk85y7', 'cmnq968nk0000vkuf3vehzp5a', 'cmnqa00eg0000s0ufaj2i20yr', '2026-04-08 17:15:03.534');
INSERT INTO public."Bookmark" VALUES ('cmnqbxlod0006qguf2i9hugez', 'cmnq93qb90000z0uf8fhpsk71', 'cmnqa00eg0000s0ufaj2i20yr', '2026-04-08 17:36:07.933');
INSERT INTO public."Bookmark" VALUES ('cmnqbxvmp0007qgufae1wbwhf', 'cmnq93qb90000z0uf8fhpsk71', 'cmnq9jnfs000bk0ufd11mhjtt', '2026-04-08 17:36:20.833');
INSERT INTO public."Bookmark" VALUES ('cmnqbydsg0008qgufsj1sc2co', 'cmnq93qb90000z0uf8fhpsk71', 'cmnq968qm000bvkufxs24najl', '2026-04-08 17:36:44.368');
INSERT INTO public."Bookmark" VALUES ('cmnqcfseh000hqguf06323axd', 'cmnq93qb90000z0uf8fhpsk71', 'task34_published_article', '2026-04-08 17:50:16.457');
INSERT INTO public."Bookmark" VALUES ('cmnric3eg001rkcuf5vgygj9p', 'cmnribnho0004qwuf28qyoel7', 'cmnric38e000vkcufp6ivk59e', '2026-04-09 13:23:07.96');
INSERT INTO public."Bookmark" VALUES ('cmnric3en001skcufrfdok92n', 'cmnribnho0004qwuf28qyoel7', 'cmnric39x000zkcuf7cd7652r', '2026-04-09 13:23:07.967');
INSERT INTO public."Bookmark" VALUES ('cmnric3er001tkcuf9jowiyp6', 'cmnribnho0004qwuf28qyoel7', 'cmnric3am0012kcufk039pwng', '2026-04-09 13:23:07.971');
INSERT INTO public."Bookmark" VALUES ('cmnric3ev001ukcufsydqazcx', 'cmnribnho0005qwufxxodjn0b', 'cmnric39e000xkcuf1ucu6hkg', '2026-04-09 13:23:07.975');
INSERT INTO public."Bookmark" VALUES ('cmnric3ez001vkcuf3capt7y7', 'cmnribnho0005qwufxxodjn0b', 'cmnric3a60010kcufvadzibdl', '2026-04-09 13:23:07.979');
INSERT INTO public."Bookmark" VALUES ('cmnric3f4001wkcufdjzbu8wj', 'cmnribnho0005qwufxxodjn0b', 'cmnric3am0012kcufk039pwng', '2026-04-09 13:23:07.984');


ALTER TABLE public."Bookmark" ENABLE TRIGGER ALL;

--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Comment" DISABLE TRIGGER ALL;

INSERT INTO public."Comment" VALUES ('cmnq968qw000cvkufxqix71j1', 'The workflow section is clear and immediately reusable for a real handoff.', 'cmnq968q7000avkuftqjpi29v', 'cmnq968nl0001vkuf7u7ra66p', NULL, '2026-04-08 16:18:52.232', '2026-04-08 16:18:52.232', NULL);
INSERT INTO public."Comment" VALUES ('cmnq968r2000dvkufbttg0qz3', 'Good catch. I will add a checklist for release retrospectives next.', 'cmnq968q7000avkuftqjpi29v', 'cmnq968nk0000vkuf3vehzp5a', 'cmnq968qw000cvkufxqix71j1', '2026-04-08 16:18:52.238', '2026-04-08 16:18:52.238', NULL);
INSERT INTO public."Comment" VALUES ('cmnq99ipa0004k0uftiro87hp', 'hay qua anh oi cam on anh Do MIXI', 'task34_peer_publish_draft', 'cmnq93qb90000z0uf8fhpsk71', NULL, '2026-04-08 16:21:25.102', '2026-04-08 16:21:25.102', NULL);
INSERT INTO public."Comment" VALUES ('cmnqcfnzn000fqgufntxjbd60', 'good bro', 'task34_published_article', 'cmnq93qb90000z0uf8fhpsk71', NULL, '2026-04-08 17:50:10.739', '2026-04-08 17:50:10.739', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-0-4', 'This guide helped me set up our new microservice in half a day. The error handling section was especially useful.', 'cmnric38e000vkcufp6ivk59e', 'cmnribnho0004qwuf28qyoel7', NULL, '2026-04-09 13:23:07.858', '2026-04-09 13:23:07.858', NULL);
INSERT INTO public."Comment" VALUES ('seed-reply-0-4-0', 'Glad it helped! I''ll add a section on validation middleware next.', 'cmnric38e000vkcufp6ivk59e', 'cmnribnhn0001qwuf33ofv0mu', 'seed-comment-0-4', '2026-04-09 13:23:07.864', '2026-04-09 13:23:07.864', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-0-5', 'Could you add examples for middleware composition? I find that part tricky with TypeScript generics.', 'cmnric38e000vkcufp6ivk59e', 'cmnribnho0005qwufxxodjn0b', NULL, '2026-04-09 13:23:07.867', '2026-04-09 13:23:07.867', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-1-4', 'The multi-step migration approach saved us from a production incident. Highly recommended.', 'cmnric394000wkcufbbl1qvdm', 'cmnribnho0004qwuf28qyoel7', NULL, '2026-04-09 13:23:07.869', '2026-04-09 13:23:07.869', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-2-5', 'Great overview of App Router. Any tips on migrating from Pages Router?', 'cmnric39e000xkcuf1ucu6hkg', 'cmnribnho0005qwufxxodjn0b', NULL, '2026-04-09 13:23:07.871', '2026-04-09 13:23:07.871', NULL);
INSERT INTO public."Comment" VALUES ('seed-reply-2-5-0', 'Start by moving layouts first, then convert pages one at a time. Keep both routers running in parallel during migration.', 'cmnric39e000xkcuf1ucu6hkg', 'cmnribnhn0002qwufkjmnqg3s', 'seed-comment-2-5', '2026-04-09 13:23:07.874', '2026-04-09 13:23:07.874', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-4-4', 'We implemented this pipeline structure and cut our deploy time from 25 minutes to 8 minutes.', 'cmnric39x000zkcuf7cd7652r', 'cmnribnho0004qwuf28qyoel7', NULL, '2026-04-09 13:23:07.876', '2026-04-09 13:23:07.876', NULL);
INSERT INTO public."Comment" VALUES ('seed-reply-4-4-0', 'Nice improvement! Make sure to also cache Docker layers for even faster builds.', 'cmnric39x000zkcuf7cd7652r', 'cmnribnhm0000qwufda93e7tk', 'seed-comment-4-4', '2026-04-09 13:23:07.878', '2026-04-09 13:23:07.878', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-5-5', 'The JWT section should mention token refresh strategies too.', 'cmnric3a60010kcufvadzibdl', 'cmnribnho0005qwufxxodjn0b', NULL, '2026-04-09 13:23:07.88', '2026-04-09 13:23:07.88', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-7-4', 'We adapted this checklist for our team and it reduced onboarding time from 2 weeks to 4 days.', 'cmnric3am0012kcufk039pwng', 'cmnribnho0004qwuf28qyoel7', NULL, '2026-04-09 13:23:07.883', '2026-04-09 13:23:07.883', NULL);
INSERT INTO public."Comment" VALUES ('seed-comment-7-5', 'Would be great to have a version for frontend-focused engineers.', 'cmnric3am0012kcufk039pwng', 'cmnribnho0005qwufxxodjn0b', NULL, '2026-04-09 13:23:07.885', '2026-04-09 13:23:07.885', NULL);
INSERT INTO public."Comment" VALUES ('seed-reply-7-5-0', 'Working on it! Will publish as a separate article next week.', 'cmnric3am0012kcufk039pwng', 'cmnribnhm0000qwufda93e7tk', 'seed-comment-7-5', '2026-04-09 13:23:07.888', '2026-04-09 13:23:07.888', NULL);


ALTER TABLE public."Comment" ENABLE TRIGGER ALL;

--
-- Data for Name: HelpfulnessRating; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."HelpfulnessRating" DISABLE TRIGGER ALL;

INSERT INTO public."HelpfulnessRating" VALUES ('cmnq968r7000fvkuf6srduyvr', 'cmnq968q7000avkuftqjpi29v', 'cmnq968nl0002vkufyosjz6ig', 'HELPFUL', '2026-04-08 16:18:52.244');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnq968r7000gvkufhf08ms1k', 'cmnq968q7000avkuftqjpi29v', 'cmnq968nm0003vkufwde2kbas', 'NOT_HELPFUL', '2026-04-08 16:18:52.244');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnq968r7000evkufviuuf86x', 'cmnq968q7000avkuftqjpi29v', 'cmnq968nl0001vkuf7u7ra66p', 'HELPFUL', '2026-04-08 16:18:52.243');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnq98tks0000k0uf1moknn9l', 'task34_peer_publish_draft', 'cmnq93qb90000z0uf8fhpsk71', 'NOT_HELPFUL', '2026-04-08 16:20:52.54');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnqbx00q0004qgufje56hnzu', 'cmnqa00eg0000s0ufaj2i20yr', 'cmnq93qb90000z0uf8fhpsk71', 'HELPFUL', '2026-04-08 17:35:39.866');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnqcfbn90009qgufv6o5ckx9', 'task34_published_article', 'cmnq93qb90000z0uf8fhpsk71', 'HELPFUL', '2026-04-08 17:49:54.741');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnq9v6c00004uguff3yhybii', 'cmnq9jnfs000bk0ufd11mhjtt', 'cmnq93qb90000z0uf8fhpsk71', 'HELPFUL', '2026-04-08 16:38:15.504');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3cj0016kcuf6xsd7j7w', 'cmnric38e000vkcufp6ivk59e', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.891');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3cp0017kcuf0j2n2ef4', 'cmnric38e000vkcufp6ivk59e', 'cmnribnho0005qwufxxodjn0b', 'HELPFUL', '2026-04-09 13:23:07.897');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3d00018kcuflf4zaa1x', 'cmnric38e000vkcufp6ivk59e', 'cmnribnhn0003qwuf43ov5u7g', 'HELPFUL', '2026-04-09 13:23:07.908');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3d20019kcuftkqmzpg2', 'cmnric394000wkcufbbl1qvdm', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.91');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3d5001akcufpu9ixg4f', 'cmnric394000wkcufbbl1qvdm', 'cmnribnho0005qwufxxodjn0b', 'HELPFUL', '2026-04-09 13:23:07.913');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3d8001bkcuftgtrfufr', 'cmnric39e000xkcuf1ucu6hkg', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.916');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3da001ckcuf19k61nsa', 'cmnric39e000xkcuf1ucu6hkg', 'cmnribnho0005qwufxxodjn0b', 'HELPFUL', '2026-04-09 13:23:07.918');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dd001dkcufn2e4npw1', 'cmnric39e000xkcuf1ucu6hkg', 'cmnribnhm0000qwufda93e7tk', 'HELPFUL', '2026-04-09 13:23:07.921');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3df001ekcufmvix0iib', 'cmnric39o000ykcufpkcs87fx', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.923');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3di001fkcufxvnhu74y', 'cmnric39o000ykcufpkcs87fx', 'cmnribnho0005qwufxxodjn0b', 'NOT_HELPFUL', '2026-04-09 13:23:07.926');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dm001gkcufhmmxopgn', 'cmnric39x000zkcuf7cd7652r', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.93');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dp001hkcuf9p4fs6fi', 'cmnric39x000zkcuf7cd7652r', 'cmnribnho0005qwufxxodjn0b', 'HELPFUL', '2026-04-09 13:23:07.933');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dr001ikcuf89ncjc1u', 'cmnric3a60010kcufvadzibdl', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.935');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dt001jkcufgsl71icg', 'cmnric3a60010kcufvadzibdl', 'cmnribnho0005qwufxxodjn0b', 'HELPFUL', '2026-04-09 13:23:07.937');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dw001kkcuf7mbr00ob', 'cmnric3a60010kcufvadzibdl', 'cmnribnhn0002qwufkjmnqg3s', 'HELPFUL', '2026-04-09 13:23:07.94');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dx001lkcuf8a2ppm02', 'cmnric3af0011kcufkikr4fuf', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.942');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3dz001mkcufyetaodkf', 'cmnric3am0012kcufk039pwng', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.943');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3e2001nkcufjerjwos0', 'cmnric3am0012kcufk039pwng', 'cmnribnho0005qwufxxodjn0b', 'HELPFUL', '2026-04-09 13:23:07.946');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3e4001okcufo2p84emy', 'cmnric3aw0013kcufa5z02st0', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.948');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3e7001pkcufz6bbthjc', 'cmnric3aw0013kcufa5z02st0', 'cmnribnho0005qwufxxodjn0b', 'NOT_HELPFUL', '2026-04-09 13:23:07.951');
INSERT INTO public."HelpfulnessRating" VALUES ('cmnric3e9001qkcufl28okfit', 'cmnric3b60014kcufa1lcxotb', 'cmnribnho0004qwuf28qyoel7', 'HELPFUL', '2026-04-09 13:23:07.953');


ALTER TABLE public."HelpfulnessRating" ENABLE TRIGGER ALL;

--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Notification" DISABLE TRIGGER ALL;

INSERT INTO public."Notification" VALUES ('cmnq99ipn0005k0uf7e7a6rdu', 'task34_author_peer', 'ARTICLE_COMMENT', 'task34_peer_publish_draft', false, '2026-04-08 16:21:25.115');
INSERT INTO public."Notification" VALUES ('cmnqcfo00000gqgufcp6boob3', 'task34_author_peer', 'ARTICLE_COMMENT', 'task34_published_article', false, '2026-04-08 17:50:10.752');


ALTER TABLE public."Notification" ENABLE TRIGGER ALL;

--
-- Data for Name: Reaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

ALTER TABLE public."Reaction" DISABLE TRIGGER ALL;

INSERT INTO public."Reaction" VALUES ('cmnq7jahe0000csuf7qfstd6o', 'task34_author_owner', 'task34_owner_draft', 'LIKE', '2026-04-08 15:33:01.778', '2026-04-08 15:33:01.778');
INSERT INTO public."Reaction" VALUES ('cmnq7jai10001csufa2agu89s', 'task34_editor', 'task34_owner_draft', 'LAUGH', '2026-04-08 15:33:01.801', '2026-04-08 15:33:01.801');
INSERT INTO public."Reaction" VALUES ('cmnq98w170001k0ufwvjb7rx8', 'cmnq93qb90000z0uf8fhpsk71', 'task34_peer_publish_draft', 'LAUGH', '2026-04-08 16:20:55.723', '2026-04-08 16:20:58.152');
INSERT INTO public."Reaction" VALUES ('cmnqcfgvd000cqgufxgfmt1xm', 'cmnq93qb90000z0uf8fhpsk71', 'task34_published_article', 'LAUGH', '2026-04-08 17:50:01.513', '2026-04-08 17:50:02.854');
INSERT INTO public."Reaction" VALUES ('cmnq9v86r0005uguftz8km4cr', 'cmnq93qb90000z0uf8fhpsk71', 'cmnq9jnfs000bk0ufd11mhjtt', 'LIKE', '2026-04-08 16:38:17.907', '2026-04-08 17:57:03.991');


ALTER TABLE public."Reaction" ENABLE TRIGGER ALL;

--
-- PostgreSQL database dump complete
--

\unrestrict LLa0tuiI18la6PEA5lQ24ZuB0gSyVf2uxEnXLOv4m4uvRk7uESSOLFzaDM4WPW2

