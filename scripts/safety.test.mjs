import assert from "node:assert/strict";
import { test } from "node:test";
import { operationSafety } from "./safety.mjs";

test("operations are read-only, mutating or destructive by HTTP method", () => {
  const safetyByMethod = ["get", "post", "put", "patch", "delete"].map((method) => operationSafety(method, "some-operation"));

  assert.deepEqual(safetyByMethod, ["R", "M", "M", "M", "D"]);
});

test("a destructive override wins over the HTTP method", () => {
  const overriddenSafety = [operationSafety("get", "stop-charge"), operationSafety("post", "reboot-charge-point")];

  assert.deepEqual(overriddenSafety, ["D", "D"]);
});
