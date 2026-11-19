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

test("token exchange operations are read-only", () => {
  const tokenExchangeSafety = [
    operationSafety("post", "get-access-token-with-client-credentials"),
    operationSafety("post", "get-access-token-with-refresh-token"),
  ];

  assert.deepEqual(tokenExchangeSafety, ["R", "R"]);
});

test("starting a charge is mutating", () => {
  assert.equal(operationSafety("post", "start-charge"), "M");
});
