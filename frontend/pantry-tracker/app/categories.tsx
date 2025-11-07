import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";

interface Category {
  category_id: number;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");

  const load = async () => {
    const res = await fetch("http://127.0.0.1:5000/categories");
    const data = await res.json();
    setCategories(data);
  };

  const add = async () => {
    if (!newName) return;
    await fetch("http://127.0.0.1:5000/categories", {
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
      <Text style={styles.title}>Categories</Text>
      <TextInput placeholder="New category" value={newName} onChangeText={setNewName} style={styles.input} />
      <Button title="Add" onPress={add} />
      <FlatList
        data={categories}
        keyExtractor={(c) => c.category_id.toString()}
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
