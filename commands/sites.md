---
description: List Monta sites with charge point counts and availability
argument-hint: "[team ID or name filter]"
---

List sites from the Monta API. Read-only.

Arguments: `$ARGUMENTS` (optional team ID or a text filter on site name).

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. Call `get-sites` with `perPage: 100` (and `teamId` if given). Page through while `meta.currentPage + 1 < meta.totalPageCount`, up to 500 sites; beyond that report the total and ask for a filter.
3. Filter locally by name if a text filter was given.
4. Present a table: ID, name, team ID, city or address from `location`, charge points (`chargePointCount`), active, available, connector types, visibility. End with totals: sites, charge points, available charge points.
5. Offer `/monta:charge-points <site>` for a site's chargers or `get-site-statistics` for utilisation.
