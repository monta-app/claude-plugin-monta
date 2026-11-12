const DESTRUCTIVE_OPERATION_IDS = [
  "block-charge-auth-token",
  "block-charge-auth-token-inventory",
  "bulk-block-charge-keys",
  "bulk-reboot-charge-points",
  "bulk-unblock-charge-keys",
  "clear-charging-profile",
  "create-ocpp-config",
  "deactivate-charge-point",
  "export-user-data",
  "freeze-team",
  "lock-charge-point-cable",
  "reboot-charge-point",
  "restart-charge",
  "set-charging-profile",
  "stop-charge",
  "transfer-charge-point-to-team",
  "transfer-vehicle-ownership",
  "transferTeamOwnership",
  "unblock-charge-auth-token",
  "unblock-charge-auth-token-inventory",
  "unfreeze-team",
  "unlock-charge-point",
];

const SAFETY_BY_METHOD = {
  get: "R",
  head: "R",
  options: "R",
  trace: "R",
  post: "M",
  put: "M",
  patch: "M",
  delete: "D",
};

export const operationSafety = (method, operationId) => {
  if (DESTRUCTIVE_OPERATION_IDS.includes(operationId)) {
    return "D";
  }
  return SAFETY_BY_METHOD[method];
};
