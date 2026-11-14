export const colors = {
  primary: "#1d4ed8", primaryText: "#ffffff", bg: "#f5f7fb", card: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", muted: "#64748b", danger: "#dc2626", warn: "#b45309", ok: "#047857",
  okBg: "#d1fae5", warnBg: "#fef3c7", infoBg: "#dbeafe", greyBg: "#e2e8f0", dangerBg: "#fee2e2",
};
export const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  available: { bg: colors.okBg, fg: colors.ok }, active: { bg: colors.infoBg, fg: colors.primary },
  upcoming: { bg: colors.warnBg, fg: colors.warn }, completed: { bg: colors.greyBg, fg: colors.muted }, missed: { bg: colors.dangerBg, fg: colors.danger },
};
export const STATE_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  live: { bg: colors.dangerBg, fg: colors.danger, label: "Live now" }, available: { bg: colors.okBg, fg: colors.ok, label: "Ready to join" },
  upcoming: { bg: colors.warnBg, fg: colors.warn, label: "Upcoming" }, ended: { bg: colors.greyBg, fg: colors.muted, label: "Ended" },
  cancelled: { bg: colors.greyBg, fg: colors.muted, label: "Cancelled" }, expired: { bg: colors.greyBg, fg: colors.muted, label: "Expired" },
};
