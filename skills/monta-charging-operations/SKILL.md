---
name: monta-charging-operations
description: Step-by-step workflows for EV charging operators using Monta. Use when the user wants to investigate a failed, stuck, or zero-kWh charge, check why a charger is offline or in error, pull site or charger utilisation, reconcile charges against wallet transactions or invoices, or onboard a new site or charge point. Builds on the monta-api skill.
---

# Monta charging operations

Workflows for day-to-day operator questions. Tool names, filters, safety rules, and conventions are in the `monta-api` skill; read it first. Everything below starts with reads. Only the final step of some workflows changes anything, and those steps require confirmation with the concrete target restated.

## Investigate a failed or stuck charge

1. **Find the charge.** If the user has an ID, call `get-charge`. Otherwise `get-charges` with `chargePointId` or `siteId`, `state`, and a narrow `fromDate`/`toDate`. Stuck usually means `state` is `starting`, `charging`, `stopping`, or `releasing` long after `startedAt`, or `consumedKwh` is 0 after several minutes.
2. **Read the charge.** Report `state` and `rawState`, `startSource`, `chargeAuth` type, `startedAt`, `stoppedAt`, `failedAt`, `failureReason`, `stopReason`, `consumedKwh`, `kwhLimit`, `socLimit`, `price`, `cost`, and `payingTeam`. A `failureReason` or `stopReason` usually answers the question directly.
3. **Check the money if relevant.** `get-charge-breakdown` shows price and cost components, fees, and adjustments. `get-receipt-by-charge` shows what the driver was billed.
4. **Check the charge point.** `get-charge-point` for `state`, `lastConnectedAt`, `disconnectedAt`, `cablePluggedIn`, `firmwareVersion`, `connectors`. `disconnected` or `error` explains most stuck sessions.
5. **Read the logs around the event.** `get-charge-point-logs` with `fromDate` and `toDate` a few minutes either side of `startedAt` or `failedAt` (use cursor pagination with a large `perPage` if the window is busy). Look for OCPP `StatusNotification` errors, `Authorize` rejections, `StartTransaction`/`StopTransaction` mismatches, and `MeterValues` gaps.
6. **Check the token if authorisation failed.** `get-charge-auth-token` or `search-charge-auth-tokens` to see whether the RFID or app token is blocked or belongs to another team.
7. **Summarise** a timeline in the user's timezone and a probable cause. Offer the corrective action but do not run it: `stop-charge` for a session that will not close, `reboot-charge-point` for a charger stuck in `error`, `unlock-charge-point` for a stuck cable. Each is destructive and needs a confirmation naming the charge or charge point ID, name, and site.

## Charger offline or in error

1. `get-charge-point` for `state`, `lastConnectedAt`, `disconnectedAt`, `firmwareVersion`, `integrationType`.
2. `get-charge-point-logs` for the last connection window; check for `BootNotification` and `Heartbeat` gaps.
3. `get-reports` with the charge point as the relation to see whether drivers reported it, and `get-report-reasons` to decode the reason codes.
4. `get-charge-point-data-consumption` if the charger uses a Monta SIM and might be out of data.
5. Suggest a `reboot-charge-point` only after the reads. Ask before calling it, restating the target. If it stays offline after a reboot, it is a site power or connectivity problem, not something the API can fix.

## Site or charger utilisation

1. Resolve the site with `get-sites` (filter `teamId` or `partnerExternalId`); note `chargePointCount` and `availableChargePointCount`.
2. `get-site-statistics` with `siteId`, `fromDate`, `toDate` as `YYYY-MM-DD`, at most 31 days per call. It returns `totalEnergyConsumed`, `totalSessions`, `sessionSuccessRate`, `systemUptimePercentage`, and per-day and per-month series. For longer periods, call it once per 31-day window and add the results.
3. For per-charger detail use `get-charge-point-statistics` or `get-insights-charges-charger-report` (`teamId`, `fromDate`, `toDate`, optional `chargePointIds`), which returns sessions and kWh per charge point plus `lastChargeAt`.
4. Present a table: charge point, sessions, kWh, share of total, last charge. Flag chargers with zero sessions or a `lastChargeAt` older than the period as candidates for a fault check.

## Reconcile charges against wallet transactions

1. Pull the charges for the period: `get-charges` with `teamId`, `fromCompletedDate`, `toCompletedDate`, `perPage: 100`. Keep `id`, `completedAt`, `consumedKwh`, `price`, `cost`, `currency`, `payingTeam`.
2. Pull the money: `get-wallet-transactions` with `teamId`, `fromDate`, `toDate`, `perPage: 100`. Match on `referenceType`/`referenceId` (charge transactions reference the charge) and on amount and currency.
3. For an invoice, `get-wallet-transactions-invoice` lists the transactions behind it.
4. Report: matched count and sum, charges with no transaction, transactions with no charge, and amount mismatches. Amounts are in minor units; convert before comparing across sources.
5. Corrections are `post-operator-adjustment-transaction` (destructive, moves real money). Present the proposed `fromWalletId`, `toWalletId`, `amount`, and `currencyId` and wait for an explicit yes.

## Onboard a new site or charge point

1. Confirm the environment and the target team (`get-teams`, `get-team`). Never create resources until the user has confirmed the team ID and environment.
2. Site: `post-site` with the team ID, name, and address. Then optionally `update-site-opening-hours`, `update-site-amenities`, `update-site-energy-mix`. Each call is mutating; list the fields before calling.
3. Charge point: `post-charge-point` with `teamId`, `siteId`, `serialNumber`, and model information from the charge point brand and model tools. For many chargers, prepare a CSV and use `bulk-import-charge-points`.
4. Pricing: check `getPriceGroups` for the team and `apply-price-group` to the new charge points if the user wants something other than the default.
5. Verify: `get-charge-point` shows `state` (expect `disconnected` until the charger boots and connects), then `get-charge-point-logs` for the first `BootNotification`.
6. Access: create RFID tokens with `create-charge-auth-token` or invite drivers with `post-team-member` only if asked.

## Reporting style

Give the answer first, then a compact table, then the IDs needed for follow-up. State the timezone used for timestamps and the environment (production unless told otherwise). Do not paste raw log lines unless the user asks; quote the one or two that matter.
