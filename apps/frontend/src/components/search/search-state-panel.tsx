// Luvina
// Vu Huy Hoang - Dev2
interface SearchStatePanelProps {
  eyebrow: string;
  message: string;
  tone?: "neutral" | "danger";
}

export function SearchStatePanel({ eyebrow, message, tone = "neutral" }: SearchStatePanelProps) {
  if (tone === "danger") {
    return (
      <section className="rounded-[2rem] border border-[color:color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_8%,white)] p-6 shadow-[0_18px_50px_rgba(33,37,41,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-danger)]">{eyebrow}</p>
        <p className="mt-3 text-base leading-7 text-[var(--color-foreground)]">{message}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/90 p-10 text-center shadow-[0_18px_50px_rgba(33,37,41,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">{eyebrow}</p>
      <p className="mt-4 text-lg leading-8 text-[var(--color-foreground)]/80">{message}</p>
    </section>
  );
}