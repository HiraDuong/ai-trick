// Luvina
// Vu Huy Hoang - Dev2
import Link from "next/link";
import type { CategoryNodeDto } from "@/lib/api-types";

interface SidebarTreeProps {
  categories: CategoryNodeDto[];
  level?: number;
}

export function SidebarTree({ categories, level = 0 }: SidebarTreeProps) {
  return (
    <ul className={`space-y-3 ${level > 0 ? "mt-3 border-l border-[var(--color-line)]/70 pl-4" : ""}`}>
      {categories.map((category) => (
        <li key={category.id} className="space-y-2">
          <Link
            href={`/articles?categoryId=${encodeURIComponent(category.id)}&categoryName=${encodeURIComponent(category.name)}`}
            className="block rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-3 transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[color:color-mix(in_srgb,var(--color-accent)_8%,white)]"
          >
            <p className="text-sm font-semibold text-[var(--color-foreground)]">{category.name}</p>
            {category.description ? (
              <p className="mt-1 text-sm leading-6 text-[var(--color-foreground)]/75">{category.description}</p>
            ) : null}
          </Link>

          {category.children.length > 0 ? <SidebarTree categories={category.children} level={level + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}