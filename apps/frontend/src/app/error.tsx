// Luvina
// Vu Huy Hoang - Dev2
"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-10 shadow-[0_20px_60px_rgba(33,37,41,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-danger)]">
          Unexpected frontend error
        </p>
        <h1 className="mt-4 text-4xl text-[var(--color-foreground)] [font-family:var(--font-display)]">
          The article interface could not finish rendering.
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-foreground)]/80">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition-colors duration-200 hover:bg-[var(--color-accent-strong)]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}