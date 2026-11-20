export const partnerDocsBase = (version) => `https://developer.monta.com/api/${version}`;

// The Public API has one version, so its docs pages have no version segment
export const PUBLIC_DOCS_BASE = "https://docs.public-api.monta.com/api";

export const METHODS = ["get", "put", "post", "patch", "delete", "options", "head", "trace"];

// Same slugs as Zudoku (zudoku/src/lib/util/slugify.ts), which builds the page paths of both docs sites
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

// Every operation has its own docs page slugged from its summary; repeats get -2, -3 in spec order, deprecated ones included
export const specOperations = (spec, docsBase) => {
  const pageSlug = slugifyWithCounter();
  return Object.entries(spec.paths ?? {}).flatMap(([path, pathItem]) =>
    METHODS.filter((method) => pathItem[method] !== undefined).map((method) => {
      const operation = pathItem[method];
      const pageTitle = operation.summary || operation.operationId || `${method}-${path}`;
      return { method, path, operation, docsUrl: `${docsBase}/${pageSlug(pageTitle)}` };
    }),
  );
};
