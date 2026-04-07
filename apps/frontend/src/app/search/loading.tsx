// Luvina
// Vu Huy Hoang - Dev2
export default function SearchLoading() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="h-56 animate-pulse rounded-[2.5rem] bg-[color:color-mix(in_srgb,var(--color-accent)_10%,white)]" />
        <div className="h-40 animate-pulse rounded-[2rem] bg-[color:color-mix(in_srgb,var(--color-accent)_8%,white)]" />
        <div className="h-40 animate-pulse rounded-[2rem] bg-[color:color-mix(in_srgb,var(--color-accent)_8%,white)]" />
      </div>
    </main>
  );
}