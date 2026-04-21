import assert from "node:assert/strict";
import test from "node:test";
import { formatLocalDateKey, getLastNDateKeys, localDayBounds } from "../utils/dateKey";

test("formatLocalDateKey returns YYYY-MM-DD", () => {
  const d = new Date("2026-01-05T23:11:00.000Z");
  const key = formatLocalDateKey(d);
  assert.match(key, /^\d{4}-\d{2}-\d{2}$/);
});

test("getLastNDateKeys returns ascending consecutive day keys", () => {
  const keys = getLastNDateKeys(3, new Date("2026-04-21T12:00:00.000Z"));
  assert.equal(keys.length, 3);
  assert.deepEqual(keys, ["2026-04-19", "2026-04-20", "2026-04-21"]);
});

test("localDayBounds creates a full-day interval in ISO format", () => {
  const bounds = localDayBounds("2026-04-21");
  assert.ok(bounds.startTime.endsWith("Z"));
  assert.ok(bounds.endTime.endsWith("Z"));
  assert.ok(Date.parse(bounds.endTime) > Date.parse(bounds.startTime));
});
