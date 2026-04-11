"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { registerWithCredentials, setStoredAccessToken } from "@/lib/auth";

interface RegisterFormProps {
  redirectTo: string;
}

function normalizeRedirectPath(redirectTo: string): string {
  return redirectTo.startsWith("/") ? redirectTo : "/";
}

function buildLoginHref(redirectTo: string): string {
  const params = new URLSearchParams({ redirectTo: normalizeRedirectPath(redirectTo) });
  return `/login?${params.toString()}`;
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await registerWithCredentials(name.trim(), email.trim(), password);
    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(false);
      return;
    }

    setStoredAccessToken(result.data.accessToken);
    startTransition(() => {
      router.replace(normalizeRedirectPath(redirectTo));
      router.refresh();
    });
  }

  return (
    <section className="rounded-[2.25rem] border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-8 shadow-[0_24px_80px_rgba(33,37,41,0.08)] sm:p-10">
      <div className="max-w-2xl space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-muted)]">Authentication</p>
        <h1 className="text-4xl leading-[1.02] text-[var(--color-foreground)] [font-family:var(--font-display)] sm:text-6xl">
          Create your account to start contributing knowledge.
        </h1>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Name</span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            className="w-full rounded-[1.4rem] border border-[var(--color-line)] bg-white px-4 py-3 text-base text-[var(--color-foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-[1.4rem] border border-[var(--color-line)] bg-white px-4 py-3 text-base text-[var(--color-foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-[1.4rem] border border-[var(--color-line)] bg-white px-4 py-3 text-base text-[var(--color-foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
            minLength={8}
            required
          />
        </label>

        {errorMessage ? (
          <div className="rounded-[1.4rem] border border-[color:color-mix(in_srgb,var(--color-danger)_26%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] px-4 py-3 text-sm leading-7 text-[var(--color-foreground)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
              isSubmitting
                ? "cursor-not-allowed bg-[var(--color-accent)]/70 text-[var(--color-accent-contrast)]"
                : "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-strong)]"
            }`}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <Link
            href={buildLoginHref(redirectTo)}
            className="rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            I already have an account
          </Link>
        </div>
      </form>
    </section>
  );
}
