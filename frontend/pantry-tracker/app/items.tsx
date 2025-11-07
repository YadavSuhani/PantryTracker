import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface Item {
  item_id: number;
  name: string;
  category: string | null;
  location: string | null;
  qty: number;
}

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const router = useRouter();

  const loadItems = async () => {
    const res = await fetch("http://127.0.0.1:5000/items");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Items</Text>
        <Button title="Add Item" onPress={() => router.push("/add-item" as any)} />
      </View>

      {items.length === 0 ? (
        <Text>No items found.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.item_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Category: {item.category}</Text>
              <Text>Location: {item.location}</Text>
              <Text>Qty: {item.qty}</Text>
              <Button
                    title="Edit"
                    onPress={() => router.push(`/edit-item?id=${item.item_id}` as any)}
                />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: { fontWeight: "bold", fontSize: 18 },
});
