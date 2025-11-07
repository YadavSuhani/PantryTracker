import { View, Text, Button, StyleSheet, useWindowDimensions, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors"


const ColorScheme = useColorScheme
export default function Home() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isWide = width > 600;

  return (
    <View style={[styles.container, isWide && styles.wide]}>
      <Text style={styles.title}>Pantry Tracker</Text>
      <Button title="Manage Items" onPress={() => router.push("/items" as any)} />
      <Button title="Manage Categories" onPress={() => router.push("/categories" as any)} />
      <Button title="Manage Locations" onPress={() => router.push("/locations" as any)} />
      <Button title="View Reports" onPress={() => router.push("/report" as any)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  wide: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-evenly" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20  },
});
