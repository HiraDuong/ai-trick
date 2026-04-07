// Luvina
// Vu Huy Hoang - Dev2
import { SearchHero } from "@/components/search/search-hero";
import { SearchPagination } from "@/components/search/search-pagination";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchStatePanel } from "@/components/search/search-state-panel";
import { fetchSearchResults } from "@/lib/api";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readString(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function parseInteger(value: string | string[] | undefined, fallback: number): number {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (!normalizedValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(normalizedValue, 10);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = readString(resolvedSearchParams.q).trim();
  const skip = parseInteger(resolvedSearchParams.skip, 0);
  const limit = Math.min(Math.max(parseInteger(resolvedSearchParams.limit, 6), 1), 12);

  const result = query ? await fetchSearchResults(query, skip, limit) : null;
  const errorMessage = result && !result.ok ? result.message : null;
  const searchData = result && result.ok ? result.data : null;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <SearchHero query={query} />

        {!query ? (
          <SearchStatePanel
            eyebrow="Enter a keyword above"
            message="Try a topic, article title, or phrase from article content."
          />
        ) : errorMessage ? (
          <SearchStatePanel eyebrow="Search unavailable" message={errorMessage} tone="danger" />
        ) : !searchData || searchData.items.length === 0 ? (
          <SearchStatePanel
            eyebrow="No matches found"
            message={`No published articles matched “${query}”. Try a shorter or broader keyword.`}
          />
        ) : (
          <>
            <section className="grid gap-5">
              {searchData.items.map((item) => <SearchResultCard key={item.id} item={item} />)}
            </section>

            <SearchPagination query={query} skip={skip} limit={limit} pagination={searchData.pagination} />
          </>
        )}
      </div>
    </main>
  );
}