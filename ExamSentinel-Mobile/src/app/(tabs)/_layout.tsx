import React from "react";
import { ColorValue, Text } from "react-native";
import { Tabs } from "expo-router";
import { colors } from "../../lib/theme";

const icon = (glyph: string) => ({ color }: { color: ColorValue }) => <Text style={{ fontSize: 18, color }}>{glyph}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerStyle: { backgroundColor: colors.card }, headerTitleStyle: { color: colors.text } }}>
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: icon("🏠") }} />
      <Tabs.Screen name="interviews" options={{ title: "Interviews", tabBarIcon: icon("📋") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
