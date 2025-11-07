import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

interface Item {
  item_id: number;
  name: string;
  category: string | null;
  location: string | null;
  qty: number;
  unit?: string;
}

export default function EditItem() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // ✅ Use a single item, not an array
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/items`)
      .then((r) => r.json())
      .then((data: Item[]) => {
        const found = data.find((i) => i.item_id.toString() === id);
        if (found) setItem(found);
      });
  }, [id]);

  const saveChanges = async () => {
    if (!item) return;
    await fetch(`http://127.0.0.1:5000/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    router.push("/items" as any);
  };

  if (!item) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Item</Text>

      <TextInput
        value={item.name}
        onChangeText={(t) => setItem({ ...item, name: t })}
        style={styles.input}
      />

      <TextInput
        value={item.qty?.toString()}
        onChangeText={(t) => setItem({ ...item, qty: Number(t) })}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        value={item.unit || ""}
        onChangeText={(t) => setItem({ ...item, unit: t })}
        style={styles.input}
      />

      <Button title="Save Changes" onPress={saveChanges} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    padding: 8,
  },
});
