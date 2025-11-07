import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import Colors from "../constants/colors";


interface Category {
  category_id: number;
  name: string;
}

interface Location {
  location_id: number;
  name: string;
}

export default function AddItem() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [location, setLocation] = useState<number | null>(null);
  const [minQty, setMinQty] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/categories")
      .then((r) => r.json())
      .then(setCategories);
    fetch("http://127.0.0.1:5000/locations")
      .then((r) => r.json())
      .then(setLocations);
  }, []);

  const saveItem = async () => {
    if (!name || !qty || !category || !location)
      return alert("Please fill all required fields.");

    const payload = {
      name,
      qty: Number(qty),
      unit,
      category_id: category,
      location_id: location,
      min_qty: Number(minQty) || 0,
      expiry_date: expiryDate ? expiryDate.toISOString().split("T")[0] : null,
    };

    await fetch("http://127.0.0.1:5000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    router.push("/items" as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, 
      }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add New Item</Text>

        <TextInput
          placeholder="Item name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Quantity"
          keyboardType="numeric"
          value={qty}
          onChangeText={setQty}
          style={styles.input}
        />

        <TextInput
          placeholder="Unit (e.g., kg, pcs)"
          value={unit}
          onChangeText={setUnit}
          style={styles.input}
        />

        <Text style={styles.label}>Minimum Quantity:</Text>
        <TextInput
          placeholder="Minimum quantity to restock"
          keyboardType="numeric"
          value={minQty}
          onChangeText={setMinQty}
          style={styles.input}
        />

        <Text style={styles.label}>Expiry Date:</Text>
        <Button
          title={expiryDate ? expiryDate.toDateString() : "Select Date"}
          onPress={() => setShowDatePicker(true)}
        />

        {showDatePicker && (
          <DateTimePicker
            value={expiryDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setExpiryDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Category:</Text>
        <Picker
          selectedValue={category}
          onValueChange={(v) => setCategory(v)}
          style={styles.picker}
        >
          <Picker.Item label="Select" value={null} />
          {categories.map((c) => (
            <Picker.Item
              key={c.category_id}
              label={c.name}
              value={c.category_id}
            />
          ))}
        </Picker>

        <Text style={styles.label}>Location:</Text>
        <Picker
          selectedValue={location}
          onValueChange={(v) => setLocation(v)}
          style={styles.picker}
        >
          <Picker.Item label="Select" value={null} />
          {locations.map((l) => (
            <Picker.Item
              key={l.location_id}
              label={l.name}
              value={l.location_id}
            />
          ))}
        </Picker>

        <View style={{ marginTop: 20 }}>
          <Button title="Save" onPress={saveItem} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    padding: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
});
