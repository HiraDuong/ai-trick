// Luvina
// Vu Huy Hoang - Dev2
export function buildTagHref(tagId: string, tagName: string): string {
  const params = new URLSearchParams({ name: tagName });
  return `/tags/${tagId}?${params.toString()}`;
}