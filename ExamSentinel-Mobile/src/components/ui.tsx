import React from "react";
import { ActivityIndicator, Pressable, RefreshControlProps, ScrollView, StyleSheet, Text, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../lib/theme";

export const Screen = ({ children, scroll = true, refreshControl, edges }: { children: React.ReactNode; scroll?: boolean; refreshControl?: React.ReactElement<RefreshControlProps>; edges?: ("top" | "bottom" | "left" | "right")[] }) => (
  <SafeAreaView style={s.screen} edges={edges ?? ["left", "right", "bottom"]}>
    {scroll ? <ScrollView contentContainerStyle={s.pad} refreshControl={refreshControl} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={[s.pad, { flex: 1 }]}>{children}</View>}
  </SafeAreaView>
);

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => <View style={[s.card, style]}>{children}</View>;

export function Button({ title, onPress, disabled, loading, variant = "primary" }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean; variant?: "primary" | "outline" | "danger" }) {
  const off = disabled || loading;
  const bg = variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : "transparent";
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={off} style={({ pressed }) => [s.btn, { backgroundColor: bg, borderColor: variant === "outline" ? colors.border : bg, opacity: off ? 0.5 : pressed ? 0.85 : 1 }]}>
      {loading ? <ActivityIndicator color={variant === "outline" ? colors.primary : "#fff"} /> : <Text style={[s.btnText, variant === "outline" && { color: colors.text }]}>{title}</Text>}
    </Pressable>
  );
}

export const Pill = ({ text, bg, fg }: { text: string; bg: string; fg: string }) => (
  <View style={[s.pill, { backgroundColor: bg }]}><Text style={[s.pillText, { color: fg }]}>{text}</Text></View>
);
export const H1 = ({ children }: { children: React.ReactNode }) => <Text style={s.h1}>{children}</Text>;
export const Muted = ({ children, style }: { children: React.ReactNode; style?: object }) => <Text style={[s.muted, style]}>{children}</Text>;
export const Center = ({ children }: { children: React.ReactNode }) => <View style={s.center}>{children}</View>;
export const Spinner = () => <Center><ActivityIndicator size="large" color={colors.primary} /></Center>;
export const ErrorBox = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <Card><Text style={{ color: colors.danger, marginBottom: 8 }}>{message}</Text>{onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} /> : null}</Card>
);

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, pad: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  btn: { minHeight: 48, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  btnText: { color: colors.primaryText, fontSize: 16, fontWeight: "600" },
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }, pillText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  h1: { fontSize: 24, fontWeight: "700", color: colors.text }, muted: { color: colors.muted, fontSize: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
