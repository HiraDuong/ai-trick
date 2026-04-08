// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma } from "@prisma/client";

type JsonLikeValue = Prisma.JsonValue | Prisma.InputJsonValue;

function isRecord(value: JsonLikeValue): value is Record<string, JsonLikeValue> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function hasMeaningfulJsonContent(value: JsonLikeValue): boolean {
  if (value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulJsonContent(item));
  }

  if (isRecord(value)) {
    return Object.values(value).some((item) => hasMeaningfulJsonContent(item));
  }

  return false;
}

export function areJsonValuesEqual(left: JsonLikeValue, right: JsonLikeValue): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return left === right;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => areJsonValuesEqual(item, right[index] as JsonLikeValue));
  }

  if (isRecord(left) || isRecord(right)) {
    if (!isRecord(left) || !isRecord(right)) {
      return false;
    }

    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every(
      (key, index) =>
        key === rightKeys[index] &&
        areJsonValuesEqual(left[key] as JsonLikeValue, right[key] as JsonLikeValue)
    );
  }

  return false;
}