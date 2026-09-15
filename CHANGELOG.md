# Changelog

## 0.1.4

- The operator wallet adjustment is no longer exposed by the hosted MCP server; skills and the wallet command now point to Monta Hub for corrections.

## 0.1.3

- Webhooks command quotes the exact event type names.
- Setup skill describes the Claude Desktop connector dialog and the stale "Not connected" panel.

## 0.1.2

- New commands: `help`, `teams`, `wallet`, `webhooks`, and `charge-point`.

## 0.1.1

- Refer to the Monta API instead of the Partner API throughout. The MCP server is now named `monta-api` and the core skill is `monta-api`; reconnect once after updating.

## 0.1.0

- Initial release: hosted Monta API MCP connector, `setup`, `monta-api`, and `monta-charging-operations` skills, and the `charge-points`, `charges`, `charger-report`, and `sites` commands.
