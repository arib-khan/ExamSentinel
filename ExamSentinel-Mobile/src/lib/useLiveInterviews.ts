import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ApiError } from "../api/client";
import { LiveInterview, liveApi } from "../api/liveInterviews";

/** The candidate's interviews. Reloads when the screen gains focus and every 30 s (the Join button appears by itself). */
export function useLiveInterviews() {
  const [items, setItems] = useState<LiveInterview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    try { setItems(await liveApi.mine()); setError(null); }
    catch (e) { setError(e instanceof ApiError ? e.message : "Something went wrong"); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => { const t = setInterval(() => { void load(); }, 30000); return () => clearInterval(t); }, [load]);
  const refresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false); }, [load]);
  return { items, error, refreshing, refresh, reload: load };
}
