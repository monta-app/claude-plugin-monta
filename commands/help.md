---
description: Show what the Monta plugin can do, grouped by area, with example prompts
---

Explain what the Monta plugin can do. Do not call any tools for this; answer from the `monta-api` skill and the list below. Keep it to one screen.

Say first: the plugin exposes one tool per Monta API endpoint, several hundred in total, filtered to what the connected credential's scopes allow. Tools are loaded on demand, so a short visible tool list does not mean a capability is missing.

Then list the areas with one or two example prompts each:

- **Sites and charge points**: list sites and chargers with state, connectors, firmware, last connection; per-site and per-charger statistics; OCPP configuration; charge point logs; issue reports from drivers. Example: "Which chargers at Site X are offline, and since when?"
- **Charges**: recent or historical sessions with kWh, price, cost, failure and stop reasons; price and cost breakdowns; kWh curves; receipts. Example: "Why did charge 8812345 stop after 2 kWh?"
- **Reports**: charger report, driver report, member cost report, charge auth token report, audit log, CDRs. Example: "Charger report for team 42 for August, sorted by kWh."
- **Teams and members**: teams, settings, members, invites, member fees, ownership. Example: "Who are the members of team 42 and which price group are they on?"
- **Pricing**: price groups, tariffs, fees, which charge points a price group applies to. Example: "Which price group is charge point 4821 on, and what does it charge per kWh?"
- **Money**: wallets and balances, wallet transactions, invoice transactions, reconciliation against charges. Example: "Reconcile last week's completed charges for team 42 against wallet transactions."
- **Access**: charge auth tokens (RFID, app, vehicle), block and unblock, sync keys to chargers. Example: "Is RFID token ABC123 blocked, and which team owns it?"
- **Users and vehicles**: users, their teams and chargers, vehicles, brands and models, integrations. Example: "Which vehicles are registered to team 42?"
- **Webhooks**: current config, event types, delivery entries and failures, signature debugging. Example: "Did any webhook deliveries fail today?"
- **Operations that change things**: start, stop, or restart a charge; reboot, unlock, activate, or put a charger in maintenance; create sites and charge points; apply price groups; freeze teams; wallet adjustments. Claude always asks before any of these and restates the exact target.

Then list the commands: `/monta:setup`, `/monta:help`, `/monta:sites`, `/monta:charge-points`, `/monta:charge-point`, `/monta:charges`, `/monta:charger-report`, `/monta:teams`, `/monta:wallet`, `/monta:webhooks`.

Close with: the hosted connector always targets production, and the full endpoint reference is at https://developer.monta.com.
