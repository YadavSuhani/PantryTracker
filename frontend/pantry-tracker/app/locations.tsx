import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";

interface Location {
  location_id: number;
  name: string;

}
export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newName, setNewName] = useState("");

  const load = async () => {
    const res = await fetch("http://127.0.0.1:5000/locations");
    const data = await res.json();
    setLocations(data);
  };

  const add = async () => {
    if (!newName) return;
    await fetch("http://127.0.0.1:5000/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Locations</Text>
      <TextInput placeholder="New location" value={newName} onChangeText={setNewName} style={styles.input} />
      <Button title="Add" onPress={add} />
      <FlatList
        data={locations}
        keyExtractor={(c) => c.location_id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 12, padding: 8 },
  item: { fontSize: 16, marginVertical: 4 },
});
