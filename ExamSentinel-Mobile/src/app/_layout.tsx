import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../auth/AuthContext";
import { Spinner } from "../components/ui";
import { colors } from "../lib/theme";

function Shell() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // route guard: signed-out -> /login, signed-in -> away from /login
  useEffect(() => {
    if (loading) return;
    const onLogin = segments[0] === "login";
    if (!user && !onLogin) router.replace("/login");
    else if (user && onLogin) router.replace("/");
  }, [user, loading, segments, router]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="interview/[id]" options={{ title: "Interview" }} />
        {/* no swipe-back during a live call */}
        <Stack.Screen name="live/[id]" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
      {loading ? <View style={StyleSheet.absoluteFill}><View style={{ flex: 1, backgroundColor: colors.bg }}><Spinner /></View></View> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Shell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
