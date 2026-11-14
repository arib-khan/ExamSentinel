import React, { useCallback, useEffect, useState } from "react";
import { Alert, AppState, BackHandler, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, ErrorBox, H1, Muted, Spinner } from "../../components/ui";
import { ApiError } from "../../api/client";
import { LiveInterview, LiveStatus, Role, liveApi } from "../../api/liveInterviews";
import { getLiveKit, isExpoGo } from "../../lib/livekit";
import { useLiveRoomNative } from "../../lib/useLiveRoomNative";
import { colors } from "../../lib/theme";
import { fmtDate } from "../../lib/format";

const ENDED: Record<string, string> = {
  ended_by_host: "The interviewer ended the interview.", ended: "This interview has ended.", cancelled: "This interview was cancelled.", expired: "The time for this interview has passed.",
};

function VideoBox({ tile, mirror, lk, style, placeholder }: { tile?: any; mirror?: boolean; lk: any; style?: object; placeholder: string }) {
  const VideoTrack = lk.VideoTrack;
  const ok = tile && tile.publication && tile.cameraOn;
  return (
    <View style={[st.videoBox, style]}>
      {ok ? <VideoTrack trackRef={{ participant: tile.participant, publication: tile.publication, source: lk.Track.Source.Camera } as any} style={StyleSheet.absoluteFill as any} objectFit="cover" mirror={!!mirror} />
        : <View style={st.placeholder}><Text style={{ color: "#cbd5e1", textAlign: "center" }}>{placeholder}</Text></View>}
    </View>
  );
}

export default function LiveRoom() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>();
  const role: Role = mode === "monitor" ? "monitor" : "candidate";
  const router = useRouter();
  const lk = getLiveKit();
  const room = useLiveRoomNative(id, role);
  const [iv, setIv] = useState<LiveInterview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const back = useCallback(() => router.replace(`/interview/${id}`), [router, id]);

  useEffect(() => { liveApi.get(id).then(setIv).catch((e) => setLoadError(e instanceof ApiError ? e.message : "Failed to load")); }, [id]);
  const inCall = room.phase === "connected" || room.phase === "reconnecting";

  useEffect(() => { // candidate screen: is the workspace phone connected?
    if (!inCall || role !== "candidate") return undefined;
    const poll = () => liveApi.status(id).then(setStatus).catch(() => {});
    poll(); const t = setInterval(poll, 5000); return () => clearInterval(t);
  }, [inCall, role, id]);

  useEffect(() => { // screen stays on during the call
    if (!inCall) return undefined;
    activateKeepAwakeAsync("live-interview").catch(() => {});
    return () => { deactivateKeepAwake("live-interview").catch(() => {}); };
  }, [inCall]);

  useEffect(() => { // hardware back / swipe must not silently drop the call
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!inCall) return false;
      Alert.alert(role === "monitor" ? "Stop monitoring?" : "Leave the interview?", role === "monitor" ? "The interviewer will no longer see your workspace." : "You can rejoin while the interview is still running.",
        [{ text: "Stay", style: "cancel" }, { text: role === "monitor" ? "Stop" : "Leave", style: "destructive", onPress: async () => { await room.leave(); back(); } }]);
      return true;
    });
    return () => sub.remove();
  }, [inCall, role, room, back]);

  useEffect(() => { // the OS pauses the camera when the app is in the background
    if (!inCall) return undefined;
    const sub = AppState.addEventListener("change", (s) => { if (s === "active") Alert.alert("Keep this screen open", role === "monitor" ? "The workspace camera only works while this app is on screen." : "The call only works while this app is on screen."); });
    return () => sub.remove();
  }, [inCall, role]);

  if (loadError) return <SafeAreaView style={st.fill}><View style={{ padding: 16, gap: 12 }}><ErrorBox message={loadError} /><Button title="Back" variant="outline" onPress={() => router.replace("/interviews")} /></View></SafeAreaView>;
  if (!iv) return <Spinner />;

  if (!lk) {
    return (
      <SafeAreaView style={st.fill}><View style={{ padding: 16, gap: 12 }}>
        <H1>Video is not available in this build</H1>
        <Muted>{isExpoGo ? "Expo Go cannot run video calls." : "The video module is missing from this build."} Install the ExamSentinel development build (see the README: EAS build or `npx expo run:android`), or join from a computer or phone browser.</Muted>
        <Button title="Back" variant="outline" onPress={back} />
      </View></SafeAreaView>
    );
  }

  if (room.phase === "ended") {
    return (
      <SafeAreaView style={st.fill}><Stack.Screen options={{ headerShown: false }} /><View style={{ padding: 16, gap: 12 }}>
        <H1>Interview ended</H1>
        <Card><Muted>{ENDED[room.endedReason || "ended"] || ENDED.ended}</Muted></Card>
        <Button title="Back to interviews" onPress={() => router.replace("/interviews")} />
      </View></SafeAreaView>
    );
  }

  if (!inCall) {
    const monitor = role === "monitor";
    return (
      <SafeAreaView style={st.fill}><Stack.Screen options={{ headerShown: true, title: monitor ? "Monitoring camera" : "Join interview" }} />
        <View style={{ padding: 16, gap: 12 }}>
          <H1>{monitor ? "Use this phone as the workspace camera" : "Join your interview"}</H1>
          <Card><Text style={{ fontWeight: "700" }}>{iv.title}</Text><Muted>{fmtDate(iv.scheduled_start)} · {iv.duration_minutes} min · with {iv.host_name}</Muted></Card>
          {monitor ? <Muted>Lean this phone behind or beside your computer so the REAR camera shows your desk, keyboard and screen. Plug it in and keep this screen open.</Muted>
            : <Muted>Keep your face clearly visible to the front camera. Headphones help avoid echo.</Muted>}
          <View style={st.disclosure}>
            <Text style={{ fontWeight: "700", color: "#78350f" }}>{monitor ? "Your workspace video is shown to the interviewer" : "Your video and audio are shared live"}</Text>
            <Text style={{ color: "#78350f" }}>{monitor ? "• This phone sends its rear camera (no microphone) to the interviewer only.\n• Nothing is recorded by ExamSentinel.\n• A red MONITORING ACTIVE banner stays on screen; press Stop monitoring any time."
              : "• Your camera and microphone are shared live with the interviewer only.\n• The interview is not recorded by ExamSentinel.\n• You can leave the call at any time."}</Text>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: agree }} onPress={() => setAgree((a) => !a)} style={st.checkRow}>
              <View style={[st.box, agree && { backgroundColor: colors.primary, borderColor: colors.primary }]}>{agree ? <Text style={{ color: "#fff" }}>✓</Text> : null}</View>
              <Text style={{ flex: 1, fontWeight: "600", color: "#78350f" }}>I understand and agree to share {monitor ? "my workspace camera" : "my camera and microphone"} for this interview.</Text>
            </Pressable>
          </View>
          {room.error ? (
            <Card style={{ backgroundColor: colors.dangerBg }}>
              <Text style={{ color: colors.danger, fontWeight: "700" }}>{room.error.code === "TOO_EARLY" ? "Not open yet" : "Could not join"}</Text>
              <Text style={{ color: colors.danger }}>{room.error.message}{room.error.opensAt ? ` (opens ${fmtDate(room.error.opensAt)})` : ""}</Text>
              {room.error.settings ? <Button title="Open app settings" variant="outline" onPress={() => { void Linking.openSettings(); }} /> : null}
            </Card>
          ) : null}
          <Button title={room.error ? "Retry" : monitor ? "Start monitoring camera" : "Join interview"} disabled={!agree} loading={room.phase === "connecting"} onPress={() => { void room.join(agree); }} />
          <Button title="Cancel" variant="outline" onPress={back} />
        </View></SafeAreaView>
    );
  }

  const me = room.tiles.find((t) => t.isLocal);
  const host = room.tiles.find((t) => t.role === "host");
  const reconnecting = room.phase === "reconnecting";
  const stop = () => Alert.alert(role === "monitor" ? "Stop monitoring?" : "Leave the interview?", role === "monitor" ? "The interviewer will no longer see your workspace." : "You can rejoin while the interview is still running.",
    [{ text: "Stay", style: "cancel" }, { text: role === "monitor" ? "Stop" : "Leave", style: "destructive", onPress: async () => { await room.leave(); back(); } }]);

  if (role === "monitor") {
    return (
      <SafeAreaView style={[st.fill, { backgroundColor: "#000" }]}><Stack.Screen options={{ headerShown: false }} />
        <View style={st.recBanner} accessibilityRole="alert"><View style={st.dot} /><Text style={st.recText}>MONITORING ACTIVE</Text><Text style={st.recSub}>{reconnecting ? "Reconnecting…" : "Connected"}</Text></View>
        <Text style={st.hint}>Your workspace is shown live to the interviewer. Nothing is recorded.</Text>
        <VideoBox tile={me} lk={lk} style={{ flex: 1, margin: 8 }} placeholder="Starting rear camera…" />
        {room.error ? <Text style={{ color: "#fecaca", textAlign: "center", padding: 8 }}>{room.error.message}</Text> : null}
        <View style={{ padding: 12 }}><Button title="Stop monitoring" variant="danger" onPress={stop} /></View>
      </SafeAreaView>
    );
  }

  const monitorOn = !!status?.participants.monitor.connected;
  return (
    <SafeAreaView style={[st.fill, { backgroundColor: "#0b1220" }]}><Stack.Screen options={{ headerShown: false }} />
      <View style={st.topBar}><Text style={{ color: "#fff", fontWeight: "700", flex: 1 }} numberOfLines={1}>{iv.title}</Text><Text style={{ color: reconnecting ? "#fde68a" : "#86efac" }}>{reconnecting ? "● Reconnecting…" : "● Connected"}</Text></View>
      {iv.monitoring_required ? <View style={[st.monBanner, { backgroundColor: monitorOn ? "#065f46" : "#92400e" }]}><Text style={{ color: "#fff" }}>{monitorOn ? "Workspace camera connected" : "Workspace camera NOT connected: open ExamSentinel on your second phone → this interview → Use as monitoring camera"}</Text></View> : null}
      <View style={{ flex: 1 }}>
        <VideoBox tile={host} lk={lk} style={{ flex: 1, margin: 8 }} placeholder="Waiting for the interviewer to join…" />
        <VideoBox tile={me} lk={lk} mirror style={st.selfView} placeholder="Camera off" />
      </View>
      {room.error ? <Text style={{ color: "#fecaca", textAlign: "center", padding: 6 }}>{room.error.message}</Text> : null}
      <View style={st.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel={room.micOn ? "Mute" : "Unmute"} onPress={room.toggleMic} style={[st.round, !room.micOn && { backgroundColor: colors.danger }]}><Text style={st.roundText}>{room.micOn ? "🎤" : "🔇"}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={room.camOn ? "Camera off" : "Camera on"} onPress={room.toggleCam} style={[st.round, !room.camOn && { backgroundColor: colors.danger }]}><Text style={st.roundText}>{room.camOn ? "📷" : "🚫"}</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Leave interview" onPress={stop} style={[st.round, { backgroundColor: colors.danger, width: 84 }]}><Text style={st.roundText}>Leave</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  videoBox: { backgroundColor: "#000", borderRadius: 12, overflow: "hidden", minHeight: 120 },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  selfView: { position: "absolute", right: 16, bottom: 16, width: 110, height: 150, borderWidth: 2, borderColor: "#fff" },
  controls: { flexDirection: "row", justifyContent: "center", gap: 16, padding: 14 },
  round: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#334155", alignItems: "center", justifyContent: "center" },
  roundText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  topBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  monBanner: { marginHorizontal: 8, padding: 10, borderRadius: 8 },
  recBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#dc2626", padding: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff" }, recText: { color: "#fff", fontWeight: "800", fontSize: 16, flex: 1 }, recSub: { color: "#fff" },
  hint: { color: "#e2e8f0", padding: 8, textAlign: "center" },
  disclosure: { gap: 8, padding: 14, borderRadius: 10, backgroundColor: "#fef3c7", borderWidth: 1, borderColor: "#fcd34d" },
  checkRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingTop: 4 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#92400e", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
});
