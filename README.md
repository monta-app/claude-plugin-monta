# Monta

[Monta](https://monta.com) is the operating platform for EV charging. This plugin connects Claude to the [Monta API](https://developer.monta.com) through Monta's hosted MCP server, so operators, fleet managers, and integrators can inspect and manage their charging infrastructure in plain language: sites, charge points, charging sessions, reports, teams, pricing, wallets, and webhooks.

The plugin bundles:

- A remote MCP connector to `https://partner-api-mcp.monta.app/mcp`, which exposes one tool per Monta API endpoint and only the tools your credentials allow.
- Skills that teach Claude the Monta domain model, API conventions, and operator workflows.
- Slash commands for the most common first tasks.

## Prerequisites

- A Monta API credential (Client ID and Client Secret). Create one in [Monta Hub](https://hub.monta.app) under **Account settings → Integrations → API** (or **Applications → Create app → Custom**). See [Access and set up API keys in Monta Hub](https://monta.com/help/en_US/monta-hub-account-settings/access-and-set-up-api-keys-in-monta-hub). Monta API access requires an agreement with Monta; see [Getting started](https://developer.monta.com/docs/getting-started).
- Claude Code, Claude Desktop, Cowork, or claude.ai with plugin support.

For reporting and investigation, a credential with `all:read` is enough and is the safer choice.

## Install

Once the plugin is listed in the Claude plugin directory:

```
/plugin install monta@claude-plugins-official
```

Until then, install it from this repository as a marketplace:

```
/plugin marketplace add monta-app/claude-plugin-monta
/plugin install monta@monta-plugins
```

Or from a local checkout:

```
/plugin marketplace add ./claude-plugin-monta
/plugin install monta@monta-plugins
```

For development, `claude --plugin-dir ./claude-plugin-monta` loads it without installing.

## Setup

Run `/monta:setup` and follow the steps, or:

1. In Claude Code, run `/mcp`, pick `monta-api`, and choose **Authenticate**. A sign-in page from `partner-api-mcp.monta.app` asks for your Client ID and Client Secret. They are forwarded to the Monta API and are not stored by the MCP server.
2. Ask Claude "who am I in Monta?" Claude calls the consumer endpoint and reports your operator, team restrictions, scopes, and rate limit.

Headless or shared setups can skip the browser flow and pass credentials from environment variables instead. Run this in your own terminal:

```bash
export MONTA_CLIENT_ID=...    # never commit these
export MONTA_CLIENT_SECRET=...
claude mcp add --transport http --scope user monta-api https://partner-api-mcp.monta.app/mcp \
  --header "X-Monta-Auth: ${MONTA_CLIENT_ID}:${MONTA_CLIENT_SECRET}"
```

## Commands

| Command | What it does |
|---|---|
| `/monta:setup` | Connects and verifies the Monta MCP server, explains credentials and scopes, and diagnoses 401/403 problems |
| `/monta:help` | Shows what the plugin can do, grouped by area, with example prompts |
| `/monta:sites [team or name]` | Lists sites with charge point counts and availability |
| `/monta:charge-points [site] [state]` | Lists charge points with state, connectors, and last-connected time |
| `/monta:charge-point <id or serial> [period]` | Deep dive on one charger: status, recent charges, statistics, and logs |
| `/monta:charges [period] [filter]` | Recent charging sessions with kWh, revenue, and failure summary |
| `/monta:charger-report [team or charge points] [period]` | Sessions and kWh per charge point for a period |
| `/monta:teams [operator or name]` | Teams with type, currency, frozen state, and site counts |
| `/monta:wallet [team] [period]` | Wallet balances and recent wallet transactions for a team |
| `/monta:webhooks [status]` | Webhook configuration and recent deliveries, including failures |

Everything else the Monta API offers (members, price groups, tariffs, tokens, vehicles, OCPP configuration, audit log, CDRs, and all write operations) is available in plain language; `/monta:help` lists the areas.

## Skills

| Skill | What it does |
|---|---|
| `setup` | Guided connection, credential, and troubleshooting flow |
| `monta-api` | Domain model, auth and scopes, pagination, dates, rate limits, and the read-only / mutating / destructive classification of every tool group |
| `monta-charging-operations` | Operator workflows: failed or stuck charges, offline chargers, site utilisation, charge-to-wallet reconciliation, onboarding a site or charge point |

## Example prompts

> "Which of our chargers are offline right now, and since when?"
>
> "Show me yesterday's charges at the Nørreport site and flag anything that failed."
>
> "Why did charge 8812345 stop after 2 kWh? Check the charge point logs."
>
> "Charger report for team 42 for August, sorted by kWh."
>
> "Reconcile last week's completed charges for team 42 against wallet transactions."
>
> "What webhook events are we subscribed to, and did any deliveries fail today?"

## Security and safety

- **Credentials never live in this repository or in prompts.** Use the sign-in page or environment variables. Do not paste a Client Secret into a chat.
- **The hosted server talks to production.** There is no sandbox behind `partner-api-mcp.monta.app`. Anything Claude changes affects real chargers, drivers, and money.
- **Reads run freely; writes are confirmed.** The skills instruct Claude to confirm every mutating call and to restate the exact target before destructive ones (delete anything, stop or restart a charge, reboot or unlock a charge point, write OCPP configuration or charging profiles, freeze a team, post a wallet adjustment).
- **Scopes limit blast radius.** The MCP server only exposes tools your credential can call. Prefer a read-only credential unless you need writes.
- **Rate limits.** Default 1000 requests per 600 seconds per credential. Claude uses filters and large page sizes to stay within it.

## Documentation and support

- [Monta API documentation](https://developer.monta.com)
- [Hosted MCP server documentation](https://partner-api-mcp.monta.app/docs)
- [Monta Hub](https://hub.monta.app)
- Monta API support: partners@monta.com or the [contact form](https://www.monta.com/uk/contact)
- Issues with this plugin: open an issue in this repository

## License

[MIT](LICENSE)
