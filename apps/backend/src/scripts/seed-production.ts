// Luvina
// Vu Huy Hoang - Dev2
import bcrypt from "bcrypt";
import {
  ArticleStatus,
  HelpfulnessValue,
  type Prisma,
  UserRole,
  PrismaClient,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const PASSWORD = "IKP@2026!";

// ── Required accounts ──────────────────────────────────
const REQUIRED_USERS = [
  { email: "task34.viewer@example.com", name: "Task34 Viewer", role: UserRole.VIEWER, password: "Passw0rd!" },
  { email: "task34.editor@example.com", name: "Task34 Editor", role: UserRole.EDITOR, password: "Passw0rd!" },
  { email: "task34.author.owner@example.com", name: "Task34 Author", role: UserRole.AUTHOR, password: "Passw0rd!" },
];

// ── Users ──────────────────────────────────────────────
const USERS = [
  { email: "admin@ikp.dev", name: "Hoang Vu", role: UserRole.EDITOR },
  { email: "author1@ikp.dev", name: "Nguyen Minh Anh", role: UserRole.AUTHOR },
  { email: "author2@ikp.dev", name: "Tran Duc Phong", role: UserRole.AUTHOR },
  { email: "author3@ikp.dev", name: "Le Thi Thanh", role: UserRole.AUTHOR },
  { email: "viewer1@ikp.dev", name: "Pham Quang Huy", role: UserRole.VIEWER },
  { email: "viewer2@ikp.dev", name: "Do Ngoc Mai", role: UserRole.VIEWER },
] as const;

// ── Categories ─────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Engineering",
    description: "Software engineering practices and patterns",
    children: [
      { name: "Backend", description: "Server-side development" },
      { name: "Frontend", description: "Client-side development" },
      { name: "DevOps", description: "Infrastructure and CI/CD" },
    ],
  },
  {
    name: "Product",
    description: "Product management and design",
    children: [
      { name: "UX Design", description: "User experience design" },
      { name: "Analytics", description: "Data-driven product decisions" },
    ],
  },
  {
    name: "Process",
    description: "Team processes and workflows",
    children: [
      { name: "Onboarding", description: "New member onboarding guides" },
      { name: "Code Review", description: "Review standards and checklists" },
    ],
  },
] as const;

// ── Tags ───────────────────────────────────────────────
const TAG_NAMES = [
  "nodejs", "typescript", "react", "nextjs", "prisma",
  "postgresql", "docker", "cloud-run", "ci-cd", "testing",
  "api-design", "security", "performance", "architecture",
  "agile", "best-practices",
];

// ── Article data ───────────────────────────────────────
function makeContent(sections: { heading: string; body: string }[]): Prisma.InputJsonValue {
  const blocks: Prisma.InputJsonValue[] = [];
  for (const s of sections) {
    blocks.push({ type: "heading", text: s.heading });
    blocks.push({ type: "paragraph", text: s.body });
  }
  return blocks as Prisma.InputJsonValue;
}

const ARTICLES: {
  title: string;
  authorIndex: number;
  categoryPath: [string, string?];
  tags: string[];
  views: number;
  status: ArticleStatus;
  content: Prisma.InputJsonValue;
}[] = [
  {
    title: "Getting Started with Express and TypeScript",
    authorIndex: 1,
    categoryPath: ["Engineering", "Backend"],
    tags: ["nodejs", "typescript", "api-design"],
    views: 342,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Why TypeScript for Express?", body: "TypeScript adds static type safety to Express applications, catching errors at compile time instead of runtime. This is especially valuable in large codebases where multiple developers contribute to the same API surface." },
      { heading: "Project setup", body: "Start with a tsconfig.json that targets ES2020 and uses strict mode. Install @types/express alongside express. Use ts-node for development and tsc for production builds." },
      { heading: "Structuring routes", body: "Organize routes by resource using Express Router. Each router module exports a configured Router instance that the main app mounts at a specific path prefix." },
      { heading: "Error handling", body: "Create a centralized error handler middleware that catches both synchronous exceptions and rejected promises. Return consistent JSON error responses with appropriate HTTP status codes." },
    ]),
  },
  {
    title: "Prisma Migration Strategies for Production",
    authorIndex: 1,
    categoryPath: ["Engineering", "Backend"],
    tags: ["prisma", "postgresql", "best-practices"],
    views: 218,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Migration lifecycle", body: "Prisma migrations track schema changes as sequential SQL files. Each migration is immutable once created and should be reviewed before merging to the main branch." },
      { heading: "Deploying safely", body: "Use prisma migrate deploy in production instead of prisma migrate dev. The deploy command applies pending migrations without generating new ones, making it safe for automated pipelines." },
      { heading: "Handling breaking changes", body: "When renaming columns or changing types, create a multi-step migration: add the new column, backfill data, then remove the old column in a subsequent migration." },
    ]),
  },
  {
    title: "Building Responsive UIs with Next.js App Router",
    authorIndex: 2,
    categoryPath: ["Engineering", "Frontend"],
    tags: ["nextjs", "react", "typescript"],
    views: 456,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "App Router fundamentals", body: "Next.js App Router uses file-system based routing with support for layouts, loading states, and error boundaries. Server Components are the default, reducing client-side JavaScript bundle size." },
      { heading: "Data fetching patterns", body: "Fetch data in Server Components using async/await directly. For client-side interactivity, use Client Components with React hooks and SWR or React Query for cache management." },
      { heading: "Responsive design", body: "Use CSS Grid and Flexbox with Tailwind utility classes for responsive layouts. Design mobile-first and progressively enhance for larger viewports." },
    ]),
  },
  {
    title: "Docker Multi-Stage Builds for Node.js",
    authorIndex: 2,
    categoryPath: ["Engineering", "DevOps"],
    tags: ["docker", "nodejs", "performance"],
    views: 189,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Why multi-stage builds?", body: "Multi-stage builds reduce final image size by separating build dependencies from runtime dependencies. A typical Node.js app can go from 1GB to under 200MB with proper staging." },
      { heading: "Stage design", body: "Use three stages: base (OS + system deps), builder (npm install + build), and runner (production node_modules + compiled output). Each stage starts fresh from the base image." },
      { heading: "Security considerations", body: "Run the final container as a non-root user. Copy only the files needed at runtime. Use npm ci instead of npm install for deterministic builds." },
    ]),
  },
  {
    title: "GitLab CI/CD Pipeline for Monorepos",
    authorIndex: 0,
    categoryPath: ["Engineering", "DevOps"],
    tags: ["ci-cd", "docker", "cloud-run"],
    views: 312,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Pipeline structure", body: "Organize pipeline stages as install, build, test, docker, and deploy. Use needs to create a directed acyclic graph where independent jobs run in parallel." },
      { heading: "Caching strategy", body: "Cache node_modules based on package-lock.json hash. Use artifact passing between stages for build outputs instead of rebuilding in each job." },
      { heading: "Deployment to Cloud Run", body: "Build container images with Kaniko in the docker stage. Deploy using gcloud run deploy with environment variables injected from GitLab CI/CD variables." },
    ]),
  },
  {
    title: "API Security Best Practices",
    authorIndex: 3,
    categoryPath: ["Engineering", "Backend"],
    tags: ["security", "api-design", "best-practices"],
    views: 275,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Authentication vs Authorization", body: "Authentication verifies identity (who are you?). Authorization checks permissions (what can you do?). Implement both as separate middleware layers in Express." },
      { heading: "JWT handling", body: "Store JWT secrets in environment variables, never in code. Set reasonable expiration times. Validate tokens on every request using middleware before route handlers." },
      { heading: "Input validation", body: "Validate and sanitize all user input at the API boundary. Use schema validation libraries to enforce expected types, lengths, and formats before processing." },
    ]),
  },
  {
    title: "Effective Code Review Guidelines",
    authorIndex: 0,
    categoryPath: ["Process", "Code Review"],
    tags: ["best-practices", "agile"],
    views: 198,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Review scope", body: "Keep pull requests small and focused. A PR should address one logical change. Large PRs slow down reviews and increase the risk of missing issues." },
      { heading: "What to look for", body: "Check for correctness, readability, and maintainability. Verify error handling, edge cases, and alignment with existing patterns. Avoid style nitpicks that should be handled by linters." },
      { heading: "Giving feedback", body: "Be specific and constructive. Explain why something should change, not just what. Distinguish between blocking issues and optional suggestions." },
    ]),
  },
  {
    title: "New Developer Onboarding Checklist",
    authorIndex: 0,
    categoryPath: ["Process", "Onboarding"],
    tags: ["best-practices", "agile"],
    views: 421,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Day 1: Environment setup", body: "Clone the monorepo, install Node.js 20, set up Docker, and run the local development stack. Verify that both backend and frontend start without errors." },
      { heading: "Week 1: Codebase walkthrough", body: "Read the README, review the architecture document, and pair with a team member on a small bug fix or feature. Submit your first pull request by end of week." },
      { heading: "Month 1: Independence", body: "Take ownership of a feature from design through deployment. Participate in code reviews and contribute to internal documentation." },
    ]),
  },
  {
    title: "PostgreSQL Performance Tuning Basics",
    authorIndex: 3,
    categoryPath: ["Engineering", "Backend"],
    tags: ["postgresql", "performance", "best-practices"],
    views: 167,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Indexing strategy", body: "Create indexes on columns used in WHERE clauses, JOIN conditions, and ORDER BY. Use composite indexes for queries that filter on multiple columns together. Monitor unused indexes periodically." },
      { heading: "Query analysis", body: "Use EXPLAIN ANALYZE to understand query execution plans. Look for sequential scans on large tables, nested loop joins, and high row estimates that differ from actual counts." },
      { heading: "Connection pooling", body: "Use PgBouncer or application-level pooling to limit the number of database connections. Each PostgreSQL connection consumes memory, so fewer persistent connections is better." },
    ]),
  },
  {
    title: "UX Research Methods for Internal Tools",
    authorIndex: 2,
    categoryPath: ["Product", "UX Design"],
    tags: ["best-practices", "agile"],
    views: 93,
    status: ArticleStatus.PUBLISHED,
    content: makeContent([
      { heading: "Why research internal tools?", body: "Internal tools serve a captive audience, but poor usability still costs time and productivity. Quick user interviews and task observations reveal friction points that developers tolerate but shouldn't have to." },
      { heading: "Lightweight methods", body: "Run 15-minute corridor tests with colleagues. Use screen recordings of real workflows to identify confusion. Track most-used and least-used features through analytics." },
      { heading: "Applying findings", body: "Prioritize fixes by frequency and severity. Small changes like clearer labels or fewer clicks often deliver more value than feature additions." },
    ]),
  },
  {
    title: "Testing Strategy for Full-Stack Apps (Draft)",
    authorIndex: 1,
    categoryPath: ["Engineering", "Backend"],
    tags: ["testing", "api-design"],
    views: 15,
    status: ArticleStatus.DRAFT,
    content: makeContent([
      { heading: "Test pyramid", body: "Write many unit tests, fewer integration tests, and a small number of end-to-end tests. Each layer provides different confidence and has different maintenance costs." },
      { heading: "Backend testing", body: "Test service layer logic with unit tests. Test API endpoints with integration tests against a real database. Use test fixtures that are independent and repeatable." },
    ]),
  },
];

// ── Comments ───────────────────────────────────────────
const COMMENTS: {
  articleIndex: number;
  userIndex: number;
  content: string;
  replies?: { userIndex: number; content: string }[];
}[] = [
  {
    articleIndex: 0,
    userIndex: 4,
    content: "This guide helped me set up our new microservice in half a day. The error handling section was especially useful.",
    replies: [
      { userIndex: 1, content: "Glad it helped! I'll add a section on validation middleware next." },
    ],
  },
  {
    articleIndex: 0,
    userIndex: 5,
    content: "Could you add examples for middleware composition? I find that part tricky with TypeScript generics.",
  },
  {
    articleIndex: 1,
    userIndex: 4,
    content: "The multi-step migration approach saved us from a production incident. Highly recommended.",
  },
  {
    articleIndex: 2,
    userIndex: 5,
    content: "Great overview of App Router. Any tips on migrating from Pages Router?",
    replies: [
      { userIndex: 2, content: "Start by moving layouts first, then convert pages one at a time. Keep both routers running in parallel during migration." },
    ],
  },
  {
    articleIndex: 4,
    userIndex: 4,
    content: "We implemented this pipeline structure and cut our deploy time from 25 minutes to 8 minutes.",
    replies: [
      { userIndex: 0, content: "Nice improvement! Make sure to also cache Docker layers for even faster builds." },
    ],
  },
  {
    articleIndex: 5,
    userIndex: 5,
    content: "The JWT section should mention token refresh strategies too.",
  },
  {
    articleIndex: 7,
    userIndex: 4,
    content: "We adapted this checklist for our team and it reduced onboarding time from 2 weeks to 4 days.",
  },
  {
    articleIndex: 7,
    userIndex: 5,
    content: "Would be great to have a version for frontend-focused engineers.",
    replies: [
      { userIndex: 0, content: "Working on it! Will publish as a separate article next week." },
    ],
  },
];

// ── Votes ──────────────────────────────────────────────
const VOTES: { articleIndex: number; userIndex: number; value: HelpfulnessValue }[] = [
  { articleIndex: 0, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 0, userIndex: 5, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 0, userIndex: 3, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 1, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 1, userIndex: 5, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 2, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 2, userIndex: 5, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 2, userIndex: 0, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 3, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 3, userIndex: 5, value: HelpfulnessValue.NOT_HELPFUL },
  { articleIndex: 4, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 4, userIndex: 5, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 5, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 5, userIndex: 5, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 5, userIndex: 2, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 6, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 7, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 7, userIndex: 5, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 8, userIndex: 4, value: HelpfulnessValue.HELPFUL },
  { articleIndex: 8, userIndex: 5, value: HelpfulnessValue.NOT_HELPFUL },
  { articleIndex: 9, userIndex: 4, value: HelpfulnessValue.HELPFUL },
];

// ── Bookmarks ──────────────────────────────────────────
const BOOKMARKS: { userIndex: number; articleIndex: number }[] = [
  { userIndex: 4, articleIndex: 0 },
  { userIndex: 4, articleIndex: 4 },
  { userIndex: 4, articleIndex: 7 },
  { userIndex: 5, articleIndex: 2 },
  { userIndex: 5, articleIndex: 5 },
  { userIndex: 5, articleIndex: 7 },
];

// ── Main ───────────────────────────────────────────────
async function main() {
  console.log("Seeding production sample data...\n");

  // 1. Users
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const users = await Promise.all(
    USERS.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, role: u.role, passwordHash },
        create: { email: u.email, name: u.name, role: u.role, passwordHash },
      })
    )
  );
  console.log(`Users: ${users.length} upserted`);

  // 1b. Required accounts (separate passwords)
  for (const ru of REQUIRED_USERS) {
    const hash = await bcrypt.hash(ru.password, 10);
    await prisma.user.upsert({
      where: { email: ru.email },
      update: { name: ru.name, role: ru.role, passwordHash: hash },
      create: { email: ru.email, name: ru.name, role: ru.role, passwordHash: hash },
    });
  }
  console.log(`Required accounts: ${REQUIRED_USERS.length} upserted`);

  // 2. Categories
  const categoryMap = new Map<string, string>();
  for (const parentCat of CATEGORIES) {
    let parent = await prisma.category.findFirst({
      where: { parentId: null, name: parentCat.name },
    });
    if (parent) {
      parent = await prisma.category.update({
        where: { id: parent.id },
        data: { description: parentCat.description },
      });
    } else {
      parent = await prisma.category.create({
        data: { name: parentCat.name, description: parentCat.description },
      });
    }
    categoryMap.set(parentCat.name, parent.id);

    for (const child of parentCat.children) {
      const childRecord = await prisma.category.upsert({
        where: { parentId_name: { parentId: parent.id, name: child.name } },
        update: { description: child.description },
        create: { name: child.name, description: child.description, parentId: parent.id },
      });
      categoryMap.set(child.name, childRecord.id);
    }
  }
  console.log(`Categories: ${categoryMap.size} upserted`);

  // 3. Tags
  const tagMap = new Map<string, string>();
  for (const tagName of TAG_NAMES) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
    tagMap.set(tagName, tag.id);
  }
  console.log(`Tags: ${tagMap.size} upserted`);

  // 4. Articles
  const articles: { id: string; title: string }[] = [];
  for (const a of ARTICLES) {
    const categoryName = a.categoryPath[1] ?? a.categoryPath[0];
    const categoryId = categoryMap.get(categoryName);
    if (!categoryId) throw new Error(`Category not found: ${categoryName}`);

    const authorId = users[a.authorIndex]!.id;
    const existing = await prisma.article.findFirst({
      where: { title: a.title, authorId },
      select: { id: true },
    });

    const data = {
      title: a.title,
      content: a.content,
      status: a.status,
      publishedAt: a.status === ArticleStatus.PUBLISHED ? new Date() : null,
      views: a.views,
      authorId,
      categoryId,
    };

    const article = existing
      ? await prisma.article.update({ where: { id: existing.id }, data })
      : await prisma.article.create({ data });

    // Tags
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
    if (a.tags.length > 0) {
      await prisma.articleTag.createMany({
        data: a.tags
          .map((t) => tagMap.get(t))
          .filter((id): id is string => !!id)
          .map((tagId) => ({ articleId: article.id, tagId })),
        skipDuplicates: true,
      });
    }

    articles.push({ id: article.id, title: article.title });
  }
  console.log(`Articles: ${articles.length} upserted`);

  // 5. Comments
  let commentCount = 0;
  for (const c of COMMENTS) {
    const articleId = articles[c.articleIndex]!.id;
    const userId = users[c.userIndex]!.id;
    const parent = await prisma.comment.upsert({
      where: { id: `seed-comment-${c.articleIndex}-${c.userIndex}` },
      update: { content: c.content },
      create: { id: `seed-comment-${c.articleIndex}-${c.userIndex}`, articleId, userId, content: c.content },
    });
    commentCount++;

    if (c.replies) {
      for (let i = 0; i < c.replies.length; i++) {
        const r = c.replies[i]!;
        await prisma.comment.upsert({
          where: { id: `seed-reply-${c.articleIndex}-${c.userIndex}-${i}` },
          update: { content: r.content },
          create: {
            id: `seed-reply-${c.articleIndex}-${c.userIndex}-${i}`,
            articleId,
            userId: users[r.userIndex]!.id,
            content: r.content,
            parentId: parent.id,
          },
        });
        commentCount++;
      }
    }
  }
  console.log(`Comments: ${commentCount} upserted`);

  // 6. Helpfulness votes
  let voteCount = 0;
  for (const v of VOTES) {
    const articleId = articles[v.articleIndex]!.id;
    const userId = users[v.userIndex]!.id;
    await prisma.helpfulnessRating.upsert({
      where: { articleId_userId: { articleId, userId } },
      update: { value: v.value },
      create: { articleId, userId, value: v.value },
    });
    voteCount++;
  }
  console.log(`Helpfulness votes: ${voteCount} upserted`);

  // 7. Bookmarks
  let bookmarkCount = 0;
  for (const b of BOOKMARKS) {
    const userId = users[b.userIndex]!.id;
    const articleId = articles[b.articleIndex]!.id;
    await prisma.bookmark.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {},
      create: { userId, articleId },
    });
    bookmarkCount++;
  }
  console.log(`Bookmarks: ${bookmarkCount} upserted`);

  console.log("\nSeed complete!");
  console.log(`\nLogin credentials (all users): ${PASSWORD}`);
  console.log("Users:");
  users.forEach((u) => console.log(`  ${u.role.padEnd(8)} ${u.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
