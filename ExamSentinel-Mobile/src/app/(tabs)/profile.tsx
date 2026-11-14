import React from "react";
import { Alert, Text } from "react-native";
import { Button, Card, H1, Muted, Screen } from "../../components/ui";
import { useAuth } from "../../auth/AuthContext";

export default function Profile() {
  const { user, signOut } = useAuth();
  const confirm = () => Alert.alert("Sign out", "Do you want to sign out?", [
    { text: "Cancel", style: "cancel" }, { text: "Sign out", style: "destructive", onPress: () => { void signOut(); } },
  ]);
  return (
    <Screen>
      <H1>Profile</H1>
      <Card><Muted>Name</Muted><Text style={{ fontSize: 17, fontWeight: "600" }}>{user?.user_name}</Text>
        <Muted>User ID</Muted><Text style={{ fontSize: 17, fontWeight: "600" }}>{user?.user_id}</Text></Card>
      <Button title="Sign out" variant="outline" onPress={confirm} />
    </Screen>
  );
}
