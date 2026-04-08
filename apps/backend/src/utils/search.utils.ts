// Luvina
// Vu Huy Hoang - Dev2
export function normalizeTagInput(value: string): string {
  return value.trim().replace(/^#+/, "").toLowerCase();
}

export function trimOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}