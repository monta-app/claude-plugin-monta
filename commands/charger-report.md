---
description: Pull the Monta charger report (sessions and kWh per charge point) for a team and period and summarise it
argument-hint: "[team ID or charge point ID(s)] [period, e.g. 30d or 2026-08-01..2026-08-31]"
---

Fetch the charger report from the Monta API and summarise it. Read-only.

Arguments: `$ARGUMENTS` (a team ID or one or more charge point IDs, and a period). Default period: the last 30 days.

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. Resolve the team. `get-insights-charges-charger-report` requires `teamId`. If the user gave charge point IDs, look one up with `get-charge-point` to find its `teamId` and pass the IDs as `chargePointIds`. If the consumer has exactly one team in `teamIds`, use it; otherwise ask or list teams with `get-teams`.
3. Convert the period to `fromDate` and `toDate`. The endpoint allows at most 31 days per call: split longer periods into 31-day windows and add the results.
4. Call `get-insights-charges-charger-report` with `perPage: 100` and page through if `meta.totalPageCount` is above 1.
5. Enrich each row with the charge point name and site from `get-charge-points` (`teamId`, `perPage: 100`) so the report reads by name, not just ID.
6. Present: total sessions and kWh for the period, then a table sorted by kWh: charge point, site, sessions, kWh, share of total, last charge at. Flag charge points with zero sessions or no charge in the last 14 days.
7. Offer `get-site-statistics` for uptime and success rate at a site, or `/monta:charges` to drill into individual sessions.
