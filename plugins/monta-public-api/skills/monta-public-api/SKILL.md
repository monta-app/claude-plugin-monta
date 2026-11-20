---
name: monta-public-api
description: Build against the Monta Public API (public-api.monta.com) over HTTP. Use whenever the user writes, runs or debugs code that calls the Monta Public API, asks about its endpoints, tokens, scopes, rate limit, pagination or charge states, or wants to read their own charging stations, charges, kWh consumption, wallet transactions, AFIR or open data, or start or stop a charge through it. Covers auth, the rate limit, safety rules, personal data and the generated endpoint references.
---

# Monta Public API

The Monta Public API is for a Monta user's own application: it reads the charging stations the user owns or administers, follows their charges, starts and stops charges, and reads the wallet of the user's personal account. It is HTTP only. There is no MCP server and there are no MCP tools for it, so you work with it by writing code that calls the API and, when the user asks, running that code. Full docs: [docs.public-api.monta.com](https://docs.public-api.monta.com).

Operators, fleets and apps with many users need the Partner API instead, which the `monta` plugin in the same marketplace covers.

## References

The references are generated from the Monta Public API OpenAPI spec:

- `references/endpoints.md`: the tags, each linking a file under `references/endpoints/` with every operation's operation ID, method and path, query filters, safety class, and docs link. Open the tag you need instead of guessing an endpoint.
- `references/deprecated.md`: deprecated operations and what replaces them. Never call a deprecated operation.
- `references/schemas.md`: request and response models with their required fields.

Only use endpoints that are in the references, and link the docs page of every endpoint the code uses.

## Terms

Talk to the user in the docs' terms and keep the API names in code:

- **Charging station**: the hardware, `charge-points` and `chargePointId` in the API. One charging station has one or more **EVSEs** (outlets); the AFIR endpoints key on `evseId`.
- **Account**: what owns charging stations and pays for charges, `team` in the API. A charge started through the API is paid by the user's personal account, from its wallet.
- **Location**: the place a charging station belongs to, `location` and `address` on a charging station in the API. The `Location` tag in the references is unrelated: `detect-location` guesses the caller's country for signup.

## Base URL and auth

- Base URL: `https://public-api.monta.com/api/v1`. **There is no sandbox.** Every call reads or changes real data on the user's Monta account. Say so before you run anything.
- Credentials are a `clientId` and `clientSecret` from an application the user creates in [Monta Hub](https://hub.monta.app/profile/applications). Hub shows the secret only once.
- `POST /api/v1/auth/token` with `{ "clientId": "...", "clientSecret": "..." }` returns an `accessToken` (valid 1 hour) and a `refreshToken` (valid 30 days) with their expiration dates. Send the access token as `Authorization: Bearer <accessToken>`.
- `POST /api/v1/auth/refresh` with `{ "refreshToken": "..." }` returns a new pair. Keep the newest pair. When the refresh token has expired too, or the call returns 401, get a new token with the client credentials.
- `GET /api/v1/auth/me` returns the application and its `scopes`. Use it as the connectivity check.
- Scopes: `all`, `charge-points` (read charging stations), `charge-transactions` (read charges), `control-charging` (start and stop charges), `wallet-transactions` (read the wallet). A call without the scope returns 403 `ACCESS_FORBIDDEN` and names the scope it needs.

## Secrets

- Never ask the user to paste the client secret, an access token or a refresh token into the chat. If they paste one anyway, don't repeat it, and tell them to create a new secret in Monta Hub.
- Never write a secret or token into a file: no source code, config, `.env` file, fixture, log or shell history. The code reads `MONTA_CLIENT_ID` and `MONTA_CLIENT_SECRET` (or the names the user picks) at runtime from the environment or the user's own secret store. You only need the variable names.
- Never print the secret or a token, and keep the client secret on a server, never in browser or mobile code.

## Rate limit

- **10 requests per 60 seconds per Monta user**, shared by all of that user's applications. `/auth/token` and `/auth/refresh` count too. The window starts with the first request.
- Reuse the access token for its hour and renew it with the refresh token. Never get a new token per call.
- Count the requests a script makes before you run it. Use `perPage` up to 100 instead of walking pages of 10, and poll a charge every 10 seconds or slower.
- Responses carry no rate limit headers. On a 429, wait `context.rateLimitResponse.resetsIn` seconds from the body before retrying the same request, and don't hardcode the limit. A 429 without `rateLimitResponse` comes from a service behind the API: wait for its `Retry-After` header when present, otherwise back off exponentially.

## Read-only first, confirm writes

The endpoint files mark every operation **R** (read-only), **M** (mutating) or **D** (destructive).

- Start with reads. A good first script makes three requests: get a token, call `GET /api/v1/auth/me` and print the application name and scopes, then call `GET /api/v1/charge-points?perPage=5` and print only the IDs.
- `start-charge` (`POST /api/v1/charges`, M) starts a real, paid charge on a real charging station. It takes only `chargePointId`, and the user's personal account pays. `stop-charge` (`POST /api/v1/charges/{chargeId}/stop`, D) stops a charge that may be charging someone's car.
- **Always ask the user before running code that starts or stops a charge**, restating the target (charging station ID and name, or charge ID), and wait for a yes. One confirmation per call. Never start or stop charges on several targets without listing every target first.
- Before retrying a start or stop, read the charge's current state. Starting is asynchronous: the response usually shows `starting`.
- In code the user will run later, put the same confirmation in front of every start and stop.

## Charges

- **Treat `state` as an open set.** The spec enum lists `reserved`, `starting`, `charging`, `stopping`, `paused`, `scheduled`, `stopped` and `completed`, but responses also carry `paying`, `releasing` and `released`, and may carry more. Handle unknown values in a default branch, never fail on them, and never validate responses against the enum.
- Charging has ended once the state is `stopped`, `releasing`, `released` or `completed`. Only `completed` is final: the energy and price no longer change. A `stopped` charge usually reaches `completed` within about 10 minutes.
- There is no failed state. A failed charge gets `failedAt` and `failureReason` and still ends in `stopped` and then `completed`, so check `failedAt` on every poll.

## Personal data

A charging station's address can be someone's home. Treat locations, addresses and coordinates as personal data: print IDs instead, show an address only when the user asks for that one, and keep locations out of logs, files and anything sent elsewhere. Charges and wallet transactions describe a person's charging and spending, so handle them the same way.

## Working with the API

- **Pagination**: `page` from 0 and `perPage` (default 10, at most 100, higher values are lowered silently) on the charges, charging station and wallet transaction lists. Responses are `{ data: [...], meta: { currentPage, perPage, itemCount, totalPageCount, totalItemCount } }`. The AFIR and open data endpoints page differently, see [Pagination](https://docs.public-api.monta.com/reference/pagination).
- **Dates**: UTC ISO 8601 with a `Z` suffix, for example `fromDate=2026-09-01T00:00:00Z`. The number of fraction digits in responses varies, so parse with a full ISO 8601 parser.
- **Errors**: `{ status, message, readableMessage, errorCode, context }`. Decide from the HTTP status, show `readableMessage` when it is not `null`, and don't retry a 403 or 404 with the same arguments. See [Errors](https://docs.public-api.monta.com/reference/errors).

When the references don't answer a question, read the guides at [docs.public-api.monta.com](https://docs.public-api.monta.com) (`llms.txt` has them as plain text) instead of guessing, and quote the page you used.
