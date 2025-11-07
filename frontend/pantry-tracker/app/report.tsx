import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";

interface ReportRow {
  item_id: number;
  item_name: string;
  category: string;
  location: string;
  qty: number;
  min_qty: number;
  shortage: number;
}
export default function Report() {
  const [data, setData] = useState<ReportRow[]>([]);

  const load = async () => {
    const res = await fetch("http://127.0.0.1:5000/report/low-stock");
    const d = await res.json();
    setData(d);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Low Stock Report</Text>
      <Button title="Refresh" onPress={load} />
      {data.length === 0 ? (
        <Text>No low-stock items.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.item_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.item_name}</Text>
              <Text>Category: {item.category}</Text>
              <Text>Location: {item.location}</Text>
              <Text>Qty: {item.qty}</Text>
              <Text>Min Qty: {item.min_qty}</Text>
              <Text>Shortage: {item.shortage}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontWeight: "bold", fontSize: 18 },
});
