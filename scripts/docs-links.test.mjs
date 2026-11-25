import assert from "node:assert/strict";
import { test } from "node:test";
import { docsIndexUrl, parseDocsIndex, slugify, specOperations } from "./docs-links.mjs";

const spec = {
  paths: {
    "/api/v1/charge-points/{id}/logs": { get: { summary: "Charge point logs | OCPP messages" } },
    "/api/v1/teams": { get: { summary: "Retrieve teams" }, post: { summary: "Create a team" } },
  },
};

const docsIndex = `GET /api/v1/charge-points/{id}/logs | Charge point logs | OCPP messages | https://developer.monta.com/api/v1/charge-points/id/logs
GET /api/v1/teams | Retrieve teams | https://developer.monta.com/api/v1/teams/get
POST /api/v1/teams | Create a team | https://developer.monta.com/api/v1/teams/post
`;

const partnerV1 = { docsOrigin: "https://developer.monta.com", docsIndexPath: "/openapi/monta-partner-api-v1-endpoints.txt" };

const docsUrls = (indexText) => specOperations(spec, parseDocsIndex(indexText), partnerV1).map(({ docsUrl }) => docsUrl);

test("slugs drop diacritics, quotes and punctuation like the docs site does", () => {
  assert.equal(slugify("Get the driver’s Ålborg CDRs (v2)!"), "get-the-drivers-alborg-cdrs-v2");
});

test("each operation links the page the docs index lists for its method and path", () => {
  assert.deepEqual(docsUrls(docsIndex), [
    "https://developer.monta.com/api/v1/charge-points/id/logs",
    "https://developer.monta.com/api/v1/teams/get",
    "https://developer.monta.com/api/v1/teams/post",
  ]);
});

test("a docs index from the staging site still gives links to the production site", () => {
  const stagingIndex = docsIndex.replaceAll("https://developer.monta.com/", "https://developer.staging.monta.com/");

  assert.deepEqual(docsUrls(stagingIndex), docsUrls(docsIndex));
});

test("an operation missing from the docs index gets no link instead of a guessed one", () => {
  const indexWithoutTeamsPost = docsIndex.replace(/^POST .*$/m, "");

  assert.equal(docsUrls(indexWithoutTeamsPost)[2], null);
});

test("a docs index answered with an HTML page fails instead of dropping every link", () => {
  assert.throws(() => parseDocsIndex("<!doctype html>\n<html lang=\"en\">"), { message: "Not a docs index line: <!doctype html>" });
});

test("an empty docs index fails instead of dropping every link", () => {
  assert.throws(() => parseDocsIndex("\n"), { message: "The docs index is empty" });
});

test("a page path starting with // still links the production site", () => {
  const index = "GET /api/v1/teams | Retrieve teams | https://developer.staging.monta.com//example.com/teams";
  const teamsSpec = { paths: { "/api/v1/teams": { get: { summary: "Retrieve teams" } } } };

  const [{ docsUrl }] = specOperations(teamsSpec, parseDocsIndex(index), partnerV1);

  assert.equal(new URL(docsUrl).host, "developer.monta.com");
});

test("the docs index is read from the production docs site by default", () => {
  assert.equal(docsIndexUrl(partnerV1, undefined), "https://developer.monta.com/openapi/monta-partner-api-v1-endpoints.txt");
});

test("the docs index is read from another site when its origin is given", () => {
  assert.equal(
    docsIndexUrl(partnerV1, "https://developer.staging.monta.com"),
    "https://developer.staging.monta.com/openapi/monta-partner-api-v1-endpoints.txt",
  );
});
