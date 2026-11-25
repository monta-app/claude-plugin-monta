export const METHODS = ["get", "put", "post", "patch", "delete", "options", "head", "trace"];

// Same slugs as Zudoku (zudoku/src/lib/util/slugify.ts), so the tag file names read like the docs site's tags
export const slugify = (text) =>
  text
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['‘’“”]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export const slugifyWithCounter = () => {
  const counts = new Map();
  return (text) => {
    const slug = slugify(text);
    const count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    return count === 0 ? slug : `${slug}-${count + 1}`;
  };
};

export const docsIndexUrl = ({ docsOrigin, docsIndexPath }, indexOrigin) => new URL(docsIndexPath, indexOrigin ?? docsOrigin).href;

// One line per operation, `METHOD path | summary | page URL`; the summary can contain " | " itself
const DOCS_INDEX_LINE = /^([A-Z]+ \/\S*) \| .* \| (https:\/\/\S+)$/;

const docsIndexEntry = (line) => {
  const match = line.match(DOCS_INDEX_LINE);
  if (match === null) {
    throw new Error(`Not a docs index line: ${line.slice(0, 100)}`);
  }
  return [match[1], match[2]];
};

// A docs site can answer a missing index with its HTML page or an empty body, which must fail instead of dropping every link
export const parseDocsIndex = (indexText) => {
  const lines = indexText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length === 0) {
    throw new Error("The docs index is empty");
  }
  return new Map(lines.map(docsIndexEntry));
};

// The index can come from a staging docs site, so a link keeps only its page path and points at the production site
const productionPageUrl = (pageUrl, docsOrigin) => {
  const docsUrl = new URL(docsOrigin);
  docsUrl.pathname = new URL(pageUrl).pathname;
  return docsUrl.href;
};

// The docs site lists a new operation only after its next deploy, so until then the operation gets no link (null)
export const specOperations = (spec, docsPages, { docsOrigin }) =>
  Object.entries(spec.paths ?? {}).flatMap(([path, pathItem]) =>
    METHODS.filter((method) => pathItem[method] !== undefined).map((method) => {
      const pageUrl = docsPages.get(`${method.toUpperCase()} ${path}`);
      const docsUrl = pageUrl !== undefined ? productionPageUrl(pageUrl, docsOrigin) : null;
      return { method, path, operation: pathItem[method], docsUrl };
    }),
  );
