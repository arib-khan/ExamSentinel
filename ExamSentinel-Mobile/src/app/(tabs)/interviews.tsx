import React from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, ErrorBox, H1, Muted, Pill, Screen, Spinner } from "../../components/ui";
import { LiveInterview } from "../../api/liveInterviews";
import { useLiveInterviews } from "../../lib/useLiveInterviews";
import { STATE_COLORS, colors } from "../../lib/theme";
import { fmtDate } from "../../lib/format";

function Group({ title, items, onOpen }: { title: string; items: LiveInterview[]; onOpen: (i: LiveInterview) => void }) {
  if (!items.length) return null;
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>{title}</Text>
      {items.map((i) => {
        const c = STATE_COLORS[i.join_state];
        return (
          <Pressable key={i.id} onPress={() => onOpen(i)} accessibilityRole="button">
            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                <Text style={{ flex: 1, fontSize: 16, fontWeight: "700", color: colors.text }}>{i.title}</Text>
                <Pill text={c.label} bg={c.bg} fg={c.fg} />
              </View>
              <Muted>{fmtDate(i.scheduled_start)} · {i.duration_minutes} min</Muted>
              <Muted>Interviewer: {i.host_name}</Muted>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Interviews() {
  const router = useRouter();
  const { items, error, refreshing, refresh, reload } = useLiveInterviews();
  if (!items && !error) return <Spinner />;
  const open = (i: LiveInterview) => router.push(`/interview/${i.id}`);
  const all = items ?? [];
  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <H1>My Interviews</H1>
      {error ? <ErrorBox message={error} onRetry={reload} /> : null}
      {all.length === 0 && !error ? <Card><Muted>You have no interviews scheduled yet.</Muted></Card> : null}
      <Group title="Ready to join" items={all.filter((i) => ["live", "available"].includes(i.join_state))} onOpen={open} />
      <Group title="Upcoming" items={all.filter((i) => i.join_state === "upcoming")} onOpen={open} />
      <Group title="Past" items={all.filter((i) => ["ended", "cancelled", "expired"].includes(i.join_state))} onOpen={open} />
    </Screen>
  );
}
