// Luvina
// Vu Huy Hoang - Dev2
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatArticleDate(value: string | null): string {
  if (!value) {
    return "Unpublished";
  }

  const parsedValue = new Date(value);
  if (Number.isNaN(parsedValue.getTime())) {
    return "Unknown date";
  }

  return longDateFormatter.format(parsedValue);
}

export function formatViewCount(views: number): string {
  return `${views.toLocaleString("en-US")} views`;
}