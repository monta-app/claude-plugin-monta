---
description: Show recent Monta charging sessions for a period with a summary of energy, revenue, and failures
argument-hint: "[period, e.g. today, 7d, 2026-09-01..2026-09-07] [site, charge point, or team filter]"
---

List recent charges from the Monta Partner API and summarise them. Read-only.

Arguments: `$ARGUMENTS` (a period and an optional filter). Default period: the last 24 hours. Accepted periods: `today`, `yesterday`, `7d`, `30d`, or `YYYY-MM-DD..YYYY-MM-DD`.

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. Convert the period to UTC ISO 8601 `fromDate` and `toDate` (`2026-09-01T00:00:00Z`). Resolve the filter to `siteId`, `chargePointId`, or `teamId` the same way `/monta:charge-points` does.
3. Call `get-charges` with the filters and `perPage: 100`. For periods over 30 days or more than a few hundred charges, use `meta.totalItemCount` and the first pages rather than fetching everything, and say so.
4. Present:
   - Totals: number of charges, total kWh, total price and cost (convert minor units to major with the currency), average kWh per charge.
   - State breakdown: completed, charging now, stopped, failed (has `failedAt` or `failureReason`), other.
   - A table of the most recent 20: ID, charge point, started at, duration, kWh, price, state, failure or stop reason.
5. Call out anomalies: zero-kWh charges, charges still in `starting`/`stopping` for more than 30 minutes, repeated failures on one charge point. Offer the failed-charge investigation from `monta-charging-operations`. Do not stop or restart any charge from this command.
