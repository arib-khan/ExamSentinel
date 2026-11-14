import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, Muted } from "../components/ui";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { isConfigured } from "../lib/config";
import { colors } from "../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const { signIn } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!userId.trim() || !password) { setError("Enter your user ID and password"); return; }
    setBusy(true); setError(null);
    try { await signIn(userId, password); }
    catch (e) { setError(e instanceof ApiError ? (e.status === 401 ? "Invalid user ID or password" : e.message) : "Sign-in failed"); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ alignItems: "center", gap: 4, marginBottom: 8 }}>
          <Text style={s.brand}>ExamSentinel</Text><Muted>Interview portal</Muted>
        </View>
        <Card style={{ gap: 12 }}>
          <Text style={s.label}>User ID</Text>
          <TextInput style={s.input} value={userId} onChangeText={setUserId} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="username" placeholder="your user ID" placeholderTextColor={colors.muted} />
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry textContentType="password" placeholder="••••••••" placeholderTextColor={colors.muted} onSubmitEditing={submit} />
          {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
          {!isConfigured ? <Text style={{ color: colors.warn }}>EXPO_PUBLIC_API_URL is not set (see .env.example).</Text> : null}
          <Button title="Sign in" onPress={submit} loading={busy} />
          {__DEV__ ? (
            // development builds only (stripped from production): fills the seeded demo candidate
            <Button title="Use demo candidate" variant="outline" onPress={() => { setUserId("candidate1@examsentinel.test"); setPassword("Candidate@123"); setError(null); }} />
          ) : null}
        </Card>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", padding: 20, gap: 12 }, brand: { fontSize: 30, fontWeight: "800", color: colors.primary },
  label: { fontWeight: "600", color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: "#fff", color: colors.text },
});
