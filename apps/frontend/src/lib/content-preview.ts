// Luvina
// Vu Huy Hoang - Dev2
const versionWordMap: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function decodeCommonHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function normalizeVersionLabels(value: string): string {
  return value.replace(/\bversion\s+(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, (_, word: string) => {
    const versionNumber = versionWordMap[word.toLowerCase()];
    return `Version ${versionNumber}`;
  });
}

export function toPlainTextPreview(value: string, maxLength = 220): string {
  const text = normalizeVersionLabels(
    decodeCommonHtmlEntities(value)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}