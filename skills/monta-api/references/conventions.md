# Monta API conventions

Source: https://developer.monta.com (Monta API reference and guides) and the OpenAPI spec at https://developer.monta.com/openapi/monta-partner-api-v1.yml.

## Environments

| Environment | Base URL | Notes |
|---|---|---|
| Production | `https://partner-api.monta.com/api/v1` | The hosted MCP server at `https://partner-api-mcp.monta.app/mcp` always uses this. |
| Sandbox | `https://partner-api.sandbox.monta.com/api/v1` | Separate database with synthetic operators, sites, and charge points. Separate credentials. Documented at https://developer.monta.com/docs/building-in-the-sandbox. Not reachable through the hosted MCP server. |

## Authentication (what the MCP server does for you)

1. `POST /api/v1/auth/token` with `{ "clientId": "...", "clientSecret": "..." }` returns `accessToken` (valid 1 hour), `refreshToken` (valid 24 hours), and both expiry timestamps.
2. Every request sends `Authorization: Bearer <accessToken>`.
3. `POST /api/v1/auth/refresh` with `{ "refreshToken": "..." }` returns a new pair.
4. `GET /api/v1/consumers/me` (`get-current-consumer`) returns `name`, `operatorId`, `operatorIds`, `teamIds`, `clientId`, `scopes`, `rateLimit`, `rateLimitIntervalInSeconds`. It needs no scope, so it is the right connectivity check.

Errors: 401 `CONSUMER_NOT_FOUND` (wrong Client ID or Secret for this environment), 401 `INVALID_ACCESS_TOKEN` (expired or invalid token), 403 `ACCESS_FORBIDDEN` (scope or team restriction), 404 `RESOURCE_NOT_FOUND`, 429 rate limit.

## Scopes

Format `entity:permission`, permissions `read`, `write`, `delete`, each including the lower ones. `all:read`, `all:write`, `all:delete` cover every entity. Each endpoint's required scope is listed in its description in the API reference. Common entities: `charge-points`, `charges`, `charge-transactions`, `control-charging`, `teams`, `team-members`, `users`, `vehicles`, `wallet-transactions`, `price-groups`, `tariffs`, `insights`, `reports`, `webhooks`, `manage-webhooks`, `ocpp-config`, `charging-profiles`, `audit-log`, `cdrs`, `operators`.

Access control: if `teamIds` on the consumer is empty, every resource under `operatorId` is visible. Otherwise only the listed teams are.

## Pagination

Offset pagination on almost all list endpoints: `page` starts at 0, `perPage` 1 to 100 (default 10).

```json
{ "data": [ ... ], "meta": { "currentPage": 0, "perPage": 10, "itemCount": 10, "totalPageCount": 12, "totalItemCount": 117 } }
```

Cursor pagination: `get-cdrs` (`cursor`, `limit`, `meta.after`), `search-audit-log` and `search-charge-auth-tokens` (`perPage`, `after`, `before`), `get-charge-point-logs` with `paginationType: cursor` (up to 1000 per page).

`get-charges` can return at most 20,000 charges for a query. Narrow with `fromDate` and `toDate`.

## Dates and time

- Filters: UTC ISO 8601 with `Z`, for example `2026-09-01T00:00:00Z`.
- Statistics endpoints (`get-site-statistics`, `get-charge-point-statistics`): `YYYY-MM-DD` in UTC, maximum 31 days between `fromDate` and `toDate`.
- Insight reports (`get-insights-charges-charger-report`, `driver-report`, `driver-member-costs-report`, `charge-auth-token-report`): full UTC ISO 8601 timestamps (`2026-09-01T00:00:00Z`) even though the spec labels them as dates; a bare date is rejected with 400. Maximum 31 days.
- CDRs: `YYYY-MM-DD`, maximum 90 days.
- Response timestamps are UTC ISO 8601 with fractional seconds. Timezone fields exist only on tariffs and schedules.

## Rate limits

Quota per credential, default 1000 requests per 600 seconds. Response headers: `RateLimit-Policy`, `RateLimit-Quota`, `RateLimit-TimeWindow`, `RateLimit-Remaining`, `RateLimit-ResetsIn`. Some endpoints run under a fair-use policy that asks for caching and exponential backoff. Contact support@monta.com for higher limits.

## Money

`price`, `cost`, wallet amounts, tariff prices, and fees are integers in minor units (cents or øre) with a separate `currency` or `currencyId`. `75` with currency `EUR` is €0.75.

## Reconciliation identifiers

Most entities accept `partnerExternalId` (your own ID) and `partnerCustomPayload`. List endpoints filter with `partnerExternalId`.

## Webhooks

- One webhook config per API credential: `get-webhook-config`, `update-webhook-config` (PUT), `delete-webhook-config`.
- Config fields: `webhookUrl` (https), `webhookSecret` (16 to 191 characters), `eventTypes[]`, `customHeaders` (max 5, `X-` prefix), `teamIds[]` (max 100).
- Event types: `charges`, `charge-points`, `charge-points-protocol-updates`, `sites`, `users`, `team-members`, `teams`, `installer-jobs`, `wallet-transactions`, `price-groups`, `subscriptions`, `plans`, `charge-auth-tokens`, `reports`, `ocpp-messages` (pilot).
- Delivery: `POST` to `webhookUrl` with `{ entries: [{ entityType, entityId, eventType, eventTime, payload }], pending, timestamp }`, signed with `X-Monta-Signature: sha1=<HMAC-SHA1 of the body using webhookSecret>`. Respond 200 quickly; failed deliveries retry every 60 seconds and are kept 24 hours. No ordering guarantee.
- Inspect deliveries with `get-webhook-entries` (`status`: `pending`, `completed`, `failed`) and `get-webhook-entries_1` for a single entry.

## API versioning

`Monta-Version: v1` is the stable default. The MCP server uses it. Deprecated endpoints (`get-afir-charge-points`, `GET /auth/me`, `get-charges-insights`, `patch-transaction`) still appear but should be avoided.
