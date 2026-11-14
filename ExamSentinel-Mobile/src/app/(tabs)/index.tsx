import React from "react";
import { RefreshControl, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, ErrorBox, H1, Muted, Pill, Screen, Spinner } from "../../components/ui";
import { useAuth } from "../../auth/AuthContext";
import { useLiveInterviews } from "../../lib/useLiveInterviews";
import { STATE_COLORS } from "../../lib/theme";
import { fmtDate } from "../../lib/format";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, error, refreshing, refresh, reload } = useLiveInterviews();
  if (!items && !error) return <Spinner />;
  const active = (items ?? []).filter((i) => ["live", "available", "upcoming"].includes(i.join_state));
  const next = active[0];
  const c = next ? STATE_COLORS[next.join_state] : null;
  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <H1>Hello, {user?.user_name}</H1>
      {error ? <ErrorBox message={error} onRetry={reload} /> : null}
      {next && c ? (
        <Card style={{ borderColor: c.fg }}>
          <Pill text={c.label} bg={c.bg} fg={c.fg} />
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{next.title}</Text>
          <Muted>{fmtDate(next.scheduled_start)} · {next.duration_minutes} min · with {next.host_name}</Muted>
          {next.join_state === "upcoming" ? <Muted>You can join from {fmtDate(next.opens_at)}.</Muted> : null}
          <Button title={next.join_state === "upcoming" ? "View details" : "Join interview"} variant={next.join_state === "upcoming" ? "outline" : "primary"} onPress={() => router.push(`/interview/${next.id}`)} />
        </Card>
      ) : items && items.length === 0 ? <Card><Muted>You have no interviews scheduled yet.</Muted></Card> : <Card><Muted>No upcoming interviews.</Muted></Card>}
      <Card>
        <Text style={{ fontWeight: "700" }}>How it works</Text>
        <Muted>The interviewer talks to you live on video. Use this phone (or your laptop) to join, and put a second phone behind your computer as the workspace camera.</Muted>
      </Card>
      <Button title="All interviews" variant="outline" onPress={() => router.push("/interviews")} />
    </Screen>
  );
}
