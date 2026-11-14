import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, ErrorBox, H1, Muted, Pill, Screen, Spinner } from "../../components/ui";
import { ApiError } from "../../api/client";
import { LiveInterview, liveApi } from "../../api/liveInterviews";
import { STATE_COLORS, colors } from "../../lib/theme";
import { fmtDate } from "../../lib/format";
import { hasNativeVideo, isExpoGo } from "../../lib/livekit";

export default function InterviewDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [iv, setIv] = useState<LiveInterview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { liveApi.get(id).then(setIv).catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load")); }, [id]);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!iv) return <Spinner />;
  const c = STATE_COLORS[iv.join_state];
  const canJoin = iv.join_state === "live" || iv.join_state === "available";
  const noVideo = !hasNativeVideo();
  return (
    <Screen>
      <Stack.Screen options={{ title: "Interview" }} />
      <H1>{iv.title}</H1>
      <Pill text={c.label} bg={c.bg} fg={c.fg} />
      {iv.description ? <Muted>{iv.description}</Muted> : null}
      <Card>
        <Text>📅 {fmtDate(iv.scheduled_start)}</Text>
        <Text>⏱ {iv.duration_minutes} minutes</Text>
        <Text>👤 Interviewer: {iv.host_name}</Text>
        <Text>🔑 Meeting code: {iv.meeting_code}</Text>
        {iv.join_state === "upcoming" ? <Muted>The room opens {fmtDate(iv.opens_at)}. This page updates by itself.</Muted> : null}
        {iv.join_state === "ended" ? <Muted>This interview has ended.</Muted> : null}
        {iv.join_state === "cancelled" ? <Muted>This interview was cancelled.</Muted> : null}
        {iv.join_state === "expired" ? <Muted>The time for this interview has passed.</Muted> : null}
      </Card>
      <Card>
        <Text style={{ fontWeight: "700" }}>How this interview works</Text>
        <Muted>The interviewer speaks with you live on video and asks the questions. There is nothing to type or answer in the app.</Muted>
        <Muted>• Device 1 (laptop or this phone): the video call, with your face clearly visible.</Muted>
        {iv.monitoring_required ? <Muted>• Device 2 (a second phone): place it behind or beside your computer so its rear camera shows your desk. It only sends video, never sound.</Muted> : null}
      </Card>
      {noVideo ? (
        <Card style={{ backgroundColor: colors.warnBg }}>
          <Text style={{ color: colors.warn, fontWeight: "700" }}>Video needs the ExamSentinel development build</Text>
          <Text style={{ color: colors.warn }}>{isExpoGo ? "Expo Go cannot run video calls." : "The video module is not part of this build."} Install the development build of this app (see docs/LIVE-INTERVIEW-SETUP.md, section 5), or join from a computer browser instead.</Text>
        </Card>
      ) : null}
      <View style={{ gap: 10 }}>
        <Button title="Join interview on this phone" disabled={!canJoin || noVideo} onPress={() => router.push({ pathname: "/live/[id]", params: { id: String(iv.id), mode: "candidate" } })} />
        {iv.monitoring_required ? <Button title="Use this phone as monitoring camera" variant="outline" disabled={!canJoin || noVideo} onPress={() => router.push({ pathname: "/live/[id]", params: { id: String(iv.id), mode: "monitor" } })} /> : null}
      </View>
    </Screen>
  );
}
