import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_DOCS_BASE, partnerDocsBase, slugify, specOperations } from "./docs-links.mjs";

const spec = {
  paths: {
    "/charge-points/{id}/grid-status": { get: { summary: "Get PowerBank status" } },
    "/teams/{id}/grid-status": { get: { summary: "Get PowerBank status" } },
    "/ping": { get: { operationId: "get-ping" } },
  },
};

const docsUrls = (docsBase) => specOperations(spec, docsBase).map(({ docsUrl }) => docsUrl);

test("slugs drop diacritics, quotes and punctuation like the docs site does", () => {
  assert.equal(slugify("Get the driver’s Ålborg CDRs (v2)!"), "get-the-drivers-alborg-cdrs-v2");
});

test("docs links are the operation page under the version path, numbered when a summary repeats", () => {
  assert.deepEqual(docsUrls(partnerDocsBase("v2")).slice(0, 2), [
    "https://developer.monta.com/api/v2/get-powerbank-status",
    "https://developer.monta.com/api/v2/get-powerbank-status-2",
  ]);
});

test("an operation without a summary is linked by its operation id", () => {
  assert.equal(docsUrls(partnerDocsBase("v1")).at(-1), "https://developer.monta.com/api/v1/get-ping");
});

test("public docs links have no version segment", () => {
  assert.equal(docsUrls(PUBLIC_DOCS_BASE)[0], "https://docs.public-api.monta.com/api/get-powerbank-status");
});
