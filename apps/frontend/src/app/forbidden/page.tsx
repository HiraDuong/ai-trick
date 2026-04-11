import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-8 shadow-[0_20px_60px_rgba(33,37,41,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-danger)]">Forbidden</p>
        <h1 className="mt-3 text-3xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
          You do not have permission to access this page.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-foreground)]/85">
          This area is restricted to article contributors with ownership access.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)]"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
