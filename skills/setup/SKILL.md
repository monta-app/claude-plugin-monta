---
name: setup
description: Connect Claude to the Monta Partner API and verify the connection. Use when the user installs the Monta plugin, runs /monta:setup, asks how to get Monta API credentials, or when Monta tools are missing, return 401 or 403, or the connection looks broken.
---

# Monta setup

Get the user connected to the hosted Monta MCP server, verify it works, and route them to a first task. Do not explain the MCP protocol. Never ask the user to paste a Client Secret into the chat.

## Step 1: Diagnose the current state

Check which Monta tools are available (tool names start with `mcp__plugin_monta_monta-partner-api__` in Claude Code).

| What you see | Branch |
|---|---|
| Monta tools available and `get-current-consumer` succeeds | **Connected** |
| Monta tools listed but calls fail with 401 | **Bad or missing credentials** |
| Monta tools listed but calls fail with 403 | **Missing scope or team restriction** |
| No Monta tools at all | **Not connected** |

## Branch: Not connected

The plugin ships a remote MCP server at `https://partner-api-mcp.monta.app/mcp`. It needs Monta Partner API credentials (a Client ID and a Client Secret).

1. If the user does not have credentials yet, send them to get some:
   - Sign in to [Monta Hub](https://hub.monta.app) as an operator admin.
   - Go to **Account settings → Integrations → API** (newer accounts: **Applications → Create app → Custom**), create an API credential, choose its scopes, and copy the Client ID and Client Secret. The secret is shown once.
   - Help article: [Access and set up API keys in Monta Hub](https://monta.com/help/en_US/monta-hub-account-settings/access-and-set-up-api-keys-in-monta-hub). Partner API access requires a commercial agreement with Monta; see [Getting started](https://developer.monta.com/docs/getting-started).
   - For read-only work, recommend a credential with `all:read`. Only grant `write` or `delete` scopes when the user actually needs to change things.
2. Connect. Pick the path that matches the client:
   - **Claude Code:** run `/mcp`, select `monta-partner-api`, and choose **Authenticate**. A browser page from `partner-api-mcp.monta.app` asks for the Monta Client ID and Client Secret. Credentials are sent to the MCP server only; it forwards them to the Partner API and does not store them.
   - **Claude Code, headless or shared config:** instead of the browser flow, set `MONTA_CLIENT_ID` and `MONTA_CLIENT_SECRET` in the environment and add the server with a header. Tell the user to run this in their own terminal (not through Claude):

     ```bash
     claude mcp add --transport http --scope user monta-partner-api https://partner-api-mcp.monta.app/mcp \
       --header "X-Monta-Auth: ${MONTA_CLIENT_ID}:${MONTA_CLIENT_SECRET}"
     ```
   - **Claude Desktop, Cowork, or claude.ai:** open the plugin's or connector's settings, enter `https://partner-api-mcp.monta.app/mcp` if asked for a URL, and complete the sign-in page with the Client ID and Client Secret.
3. Ask the user to say "done", then re-run Step 1. In Claude Code, `/reload-plugins` or `/mcp` refreshes the connection.

## Branch: Bad or missing credentials (401)

- The Client ID or Client Secret is wrong, revoked, or was never entered. Ask the user to re-authenticate (`/mcp` → `monta-partner-api` → **Authenticate**, or `claude mcp remove monta-partner-api` and re-add it with corrected environment variables).
- The Partner API error `CONSUMER_NOT_FOUND` means the credential pair does not exist in this environment. Sandbox credentials do not work against production and vice versa. The hosted MCP server always talks to **production**.
- `INVALID_ACCESS_TOKEN` means an expired bearer token was configured directly. Tokens expire after one hour; use Client ID and Secret instead so the server can refresh.

## Branch: Missing scope or team restriction (403)

- Each credential has scopes such as `charge-points:read` or `all:delete`. The MCP server hides tools the credential cannot call, so a "missing tool" is usually a missing scope, not a bug. Read `scopes` from `get-current-consumer`.
- A credential can be restricted to specific teams (`teamIds` on `get-current-consumer`). Resources outside those teams return 403 or 404.
- Fix in Monta Hub by editing the credential's scopes or team restriction, then re-authenticate.

## Branch: Connected

1. Call `get-current-consumer`. Report `name`, `operatorId`, `teamIds` (empty means all teams of the operator), `scopes`, and `rateLimit` per `rateLimitIntervalInSeconds`.
2. Say clearly which environment this is. The hosted server targets **production**; anything the user changes affects real chargers and real money.
3. Run one read to prove it: `get-teams` with `perPage: 5`, then `get-sites` with `perPage: 5`. Summarise counts and names.
4. Offer next steps: `/monta:sites`, `/monta:charge-points`, `/monta:charges`, or `/monta:charger-report`.

## Rate limits and other common failures

- **429**: the credential's quota (default 1000 requests per 600 seconds) is used up. Wait for `RateLimit-ResetsIn` seconds, then retry with smaller page sizes and date filters.
- **404 on a known ID**: the resource belongs to another operator or a team outside the credential's restriction, or was deleted. Confirm with the list endpoint before retrying.
- **Tool count looks small**: the credential has read-only scopes. That is fine for reporting; say so rather than treating it as an error.

## Tone

Short and practical. One step at a time. Never print or echo a secret, even if the user pastes one.
