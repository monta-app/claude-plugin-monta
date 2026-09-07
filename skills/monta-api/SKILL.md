---
name: monta-api
description: Core knowledge for working with the Monta API through the Monta MCP tools. Use whenever the user asks about Monta, EV charge points, chargers, charging sessions, sites, teams, wallets, price groups, charge auth tokens, or webhooks, or when calling any get-*, post-*, patch-*, put-*, or delete-* Monta tool. Covers the domain model, auth and scopes, pagination, dates, rate limits, and which operations need confirmation.
---

# Monta API

Monta is a platform for operating EV charging infrastructure. The MCP server exposes one tool per Monta API endpoint, named after the endpoint's operation ID (`get-charge-points`, `get-charge`, `post-charge-point`, `delete-team`, and so on). Full reference: [developer.monta.com](https://developer.monta.com).

Tools are often deferred because there are several hundred of them: when a tool such as `get-sites` is not in your visible list, search for it by operation ID and load it. Only conclude a tool is unavailable after searching, and then check the credential's scopes with `get-current-consumer`.

Read `references/endpoints.md` for the task-to-endpoint map and the full safety classification. Read `references/conventions.md` for auth, pagination, dates, errors, and webhooks in detail.

## Domain model

```
Operator ─┬─ sub-operators
          └─ Team ─┬─ Site ─── ChargePoint ─── connectors[] (connector types: type-2, ccs, ...)
                   ├─ TeamMember ─── User ─── Vehicle
                   ├─ PriceGroup ─── Tariff / fees
                   ├─ ChargeAuthToken (RFID, app, ...)
                   └─ Wallet ─── WalletTransaction
Charge ── chargePointId, siteId, priceGroupId, vehicleId, payingTeam, chargeAuth
Webhook config ── per API credential, operator-scoped events
```

- **Operator**: the CPO or business partner that owns the API credential. `get-current-consumer` returns `operatorId` and optional `teamIds` restrictions.
- **Team**: the account that owns charge points and pays or gets paid. `teamId` is the main filter on almost every list endpoint. Teams can be frozen (`isFrozen`).
- **Site**: a physical location under a team. Carries `chargePointCount`, `availableChargePointCount`, `location`, and supported connector types.
- **Charge point**: one charger. Key fields: `id`, `siteId`, `teamId`, `serialNumber`, `name`, `state`, `connectors`, `lastConnectedAt`, `disconnectedAt`, `firmwareVersion`, `priceGroupId`. Some OCPP tools key on `chargePointIdentity` (a string), not the numeric `id`.
- **Charge**: one charging session on a charge point. Key fields: `state`, `rawState`, `consumedKwh`, `price`, `cost`, `startedAt`, `stoppedAt`, `completedAt`, `failedAt`, `failureReason`, `stopReason`, `payingTeam`, `chargeAuth`.
- **Charge auth token**: what starts a charge (RFID card, app, vehicle). Can be blocked.
- **Wallet / wallet transaction**: money flow between teams, operators, and Monta. Amounts are in minor units of the wallet's currency.
- **Price group**: pricing applied to charge points, sites, or team members; contains tariffs and fees.

States you will see:

- Charge point `state`: `available`, `busy`, `busy-blocked`, `busy-charging`, `busy-non-charging`, `busy-non-released`, `busy-reserved`, `busy-scheduled`, `error`, `disconnected`, `passive`, `maintenance`, `other`.
- Charge `state`: `paying`, `reserved`, `starting`, `charging`, `stopping`, `paused`, `scheduled`, `stopped`, `releasing`, `released`, `completed`, `other`. The `get-charges` filter also accepts `suspended_ev` and `suspended_evse`.

## Auth and scopes

- The hosted MCP server authenticates with the user's Client ID and Client Secret and refreshes Monta API tokens itself. You never handle tokens.
- Scopes are `entity:permission` with `read` < `write` < `delete` (higher levels include lower ones); `all:delete` is full access. Tools the credential cannot call are not exposed. Check `get-current-consumer` before concluding something is broken.
- A credential may be restricted to `teamIds`. Outside those teams you get 403 or 404.

## Environment

- **Never assume production. Always find out.** The hosted server at `partner-api-mcp.monta.app` targets production only. If the user configured a different server URL or mentions sandbox or staging, ask which environment the connected server points at before any write.
- Monta documents a sandbox with its own credentials (see `references/conventions.md`). Sandbox credentials fail on production with `CONSUMER_NOT_FOUND`.
- State the environment in your answer whenever you perform or propose a write.

## Read-only, mutating, destructive

**Read-only** tools (`get-*`, except the two below) run freely. Prefer them. Always start an investigation with reads.

**Mutating** tools (`post-*`, `patch-*`, `put-*`) create or change data. Confirm with the user first, restating exactly what will change and on which target.

**Destructive** tools always need explicit confirmation with the concrete target restated in plain words, for example "Reboot charge point 4821 (Serial ABC123 at Site Nørreport)?" and a "yes" from the user before the call:

- Any `delete-*` tool.
- `stop-charge` and `restart-charge` (note: these are GET requests in the API but they change state; treat them as destructive).
- `reboot-charge-point`, `unlock-charge-point`, `deactivate-charge-point`.
- `set-charging-profile`, `clear-charging-profile`, `create-ocpp-config`.
- `freeze-team`, `unfreeze-team`.
- `post-operator-adjustment-transaction` (moves money between wallets).
- `block-charge-auth-token`, `unblock-charge-auth-token`.
- `delete-webhook-config`, `transfer-charge-point-to-team`, `transferTeamOwnership`.

Never batch destructive operations across many targets without listing every target and getting one confirmation per batch. Never retry a destructive call on the same target without checking its current state first.

## Working with the API

- **Pagination**: offset with `page` (from 0) and `perPage` (1 to 100, default 10). Responses are `{ data: [...], meta: { currentPage, perPage, itemCount, totalPageCount, totalItemCount } }`. Use `meta.totalItemCount` for counts instead of fetching every page. A few endpoints are cursor based (`cdrs`, audit log, charge auth token search, charge point logs with `paginationType: cursor`).
- **Dates**: send UTC ISO 8601 with a `Z` suffix (`2026-09-01T00:00:00Z`) for `fromDate`, `toDate`, and `fromUpdatedDate`. Statistics endpoints take `YYYY-MM-DD` and allow at most 31 days per request. Timestamps in responses are UTC. Convert to the user's timezone when presenting, and say which timezone you used.
- **Rate limit**: default quota is 1000 requests per 600 seconds per credential; `get-current-consumer` shows the actual values. A 429 means wait. Use filters (`teamId`, `siteId`, `state`, dates) and `perPage: 100` for scans instead of walking pages of 10.
- **Money**: prices and amounts are in minor currency units (cents, øre) with a `currency` field. Show them as major units with the currency code.
- **Errors**: `{ status, message, errorCode, readableMessage? }`. Show `readableMessage` or `message` to the user. Do not retry 403 or 404 with the same arguments.
- **Identifiers**: prefer `partnerExternalId` filters when the user's own system IDs are known. Ask for an ID when the user gives a name that matches several resources.

## Answer style

Lead with what the user asked for, then the numbers. Use tables for lists of charge points, charges, or sites. Include the resource IDs so the user can act on them. Keep raw JSON out of answers unless asked.
