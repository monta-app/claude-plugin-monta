---
description: Deep dive on one Monta charge point: status, connectors, recent charges, statistics, and logs
argument-hint: "<charge point ID or serial> [period, e.g. 24h or 7d]"
---

Investigate a single charge point from the Monta API. Read-only.

Arguments: `$ARGUMENTS` (a charge point ID or serial number, and an optional period; default: the last 24 hours).

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. Resolve the charge point. A number is an ID: call `get-charge-point`. A serial number: call `get-charge-points` with `perPage: 100` and match on `serialNumber`; ask if there is no unique match.
3. Report identity and health: name, serial, site (call `get-site`), team, brand and model, firmware, `state`, `cablePluggedIn`, `occupied`, `lastConnectedAt`, `disconnectedAt`, connectors with their types, price group ID, `isActive`. Use the user's timezone for timestamps and say which.
4. Recent activity: `get-charges` with `chargePointId`, `fromDate`, `toDate` for the period, `perPage: 100`. Summarise count, kWh, failures with reasons, and the last completed charge.
5. Statistics: `get-charge-point-statistics` with `chargePointId` and the period as `YYYY-MM-DD` dates (max 31 days) for sessions, kWh, success rate, and uptime.
6. Logs: `get-charge-point-logs` for the period with `paginationType: cursor` and a large `perPage`. Do not paste them; extract connection events, OCPP status changes, errors, and transaction start or stop mismatches, and quote only the lines that matter.
7. Issue reports: `get-reports` filtered to this charge point if the tool supports it; otherwise skip.
8. Close with a one-paragraph assessment and, if something is wrong, the corrective action you would suggest. Do not reboot, unlock, or change anything from this command; those need explicit confirmation naming this charge point.
