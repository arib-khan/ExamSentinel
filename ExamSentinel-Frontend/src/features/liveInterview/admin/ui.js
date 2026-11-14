export const selectCls = "border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50";
export const copyText = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
