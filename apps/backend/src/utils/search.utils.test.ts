// Luvina
// Vu Huy Hoang - Dev2
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTagInput } from "./search.utils";

test("normalizeTagInput strips leading hashes", () => {
  assert.equal(normalizeTagInput("#empty-state"), "empty-state");
});

test("normalizeTagInput normalizes case", () => {
  assert.equal(normalizeTagInput("Knowledge-Base"), "knowledge-base");
});

test("normalizeTagInput trims whitespace and preserves hyphens", () => {
  assert.equal(normalizeTagInput("  #Case-Sensitive-Tag  "), "case-sensitive-tag");
});