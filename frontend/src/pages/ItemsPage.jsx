import { useEffect, useState } from "react";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form for adding items
  const [form, setForm] = useState({
    name: "",
    qty: "",
    unit: "",
    category_id: "",
    location_id: "",
    min_qty: "",
    expiry_date: ""
  });

  // Form for editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const API = "http://127.0.0.1:5000";

  // Load data
  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchItems = () => {
    fetch(`${API}/items`).then(res => res.json()).then(setItems);
  };

  const fetchCategories = () => {
    fetch(`${API}/categories`).then(res => res.json()).then(setCategories);
  };

  const fetchLocations = () => {
    fetch(`${API}/locations`).then(res => res.json()).then(setLocations);
  };

  // ------------------------
  // Form Handling
  // ------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ------------------------
  // CRUD
  // ------------------------
  const addItem = async () => {
    await fetch(`${API}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    fetchItems();
    setForm({
      name: "",
      qty: "",
      unit: "",
      category_id: "",
      location_id: "",
      min_qty: "",
      expiry_date: ""
    });
  };

  const startEditing = (item) => {
    setEditingId(item.item_id);
    setEditForm({
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      category_id: categories.find(c => c.name === item.category)?.category_id || "",
      location_id: locations.find(l => l.name === item.location)?.location_id || "",
      min_qty: item.min_qty || "",
      expiry_date: item.expiry_date || ""
    });
  };

  const updateItem = async (id) => {
    await fetch(`${API}/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    });

    setEditingId(null);
    fetchItems();
  };

  const deleteItem = async (id) => {
    await fetch(`${API}/items/${id}`, { method: "DELETE" });
    fetchItems();
  };

  // ------------------------
  // Adding New Category/Location
  // ------------------------
  const addCategory = async () => {
    const name = prompt("Enter new category:");
    if (!name) return;

    await fetch(`${API}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    fetchCategories();
  };

  const addLocation = async () => {
    const name = prompt("Enter new location:");
    if (!name) return;

    await fetch(`${API}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    fetchLocations();
  };

  // ------------------------
  // Render UI
  // ------------------------

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Items</h2>

      {/* Add New Item */}
      <div style={styles.box}>
        <h3>Add New Item</h3>

        <input name="name" placeholder="Item Name" value={form.name} onChange={handleChange} style={styles.input} />
        <input name="qty" placeholder="Quantity" value={form.qty} onChange={handleChange} style={styles.input} />
        <input name="unit" placeholder="Unit (pcs, kg...)" value={form.unit} onChange={handleChange} style={styles.input} />

        <input name="min_qty" placeholder="Min Qty" value={form.min_qty} onChange={handleChange} style={styles.input} />

        <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} style={styles.input} />

        <select name="category_id" value={form.category_id} onChange={handleChange} style={styles.input}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
        <button onClick={addCategory} style={styles.smallBtn}>+ Add Category</button>

        <select name="location_id" value={form.location_id} onChange={handleChange} style={styles.input}>
          <option value="">Select Location</option>
          {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
        </select>
        <button onClick={addLocation} style={styles.smallBtn}>+ Add Location</button>

        <button onClick={addItem} style={styles.btn}>Add Item</button>
      </div>

      {/* Items Table */}
      <h3>Items List</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th><th>Qty</th><th>Unit</th><th>Min Qty</th><th>Expiry</th>
            <th>Category</th><th>Location</th><th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map(i => (
            <tr key={i.item_id}>
              {editingId === i.item_id ? (
                <>
                  <td><input name="name" value={editForm.name} onChange={handleEditChange} style={styles.input} /></td>
                  <td><input name="qty" value={editForm.qty} onChange={handleEditChange} style={styles.input} /></td>
                  <td><input name="unit" value={editForm.unit} onChange={handleEditChange} style={styles.input} /></td>
                  <td><input name="min_qty" value={editForm.min_qty} onChange={handleEditChange} style={styles.input} /></td>
                  <td><input type="date" name="expiry_date" value={editForm.expiry_date} onChange={handleEditChange} style={styles.input} /></td>

                  <td>
                    <select name="category_id" value={editForm.category_id} onChange={handleEditChange}>
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                    </select>
                  </td>

                  <td>
                    <select name="location_id" value={editForm.location_id} onChange={handleEditChange}>
                      <option value="">Select</option>
                      {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.name}</option>)}
                    </select>
                  </td>

                  <td>
                    <button onClick={() => updateItem(i.item_id)} style={styles.btn}>Save</button>
                    <button onClick={() => setEditingId(null)} style={styles.smallBtn}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{i.name}</td>
                  <td>{i.qty}</td>
                  <td>{i.unit}</td>
                  <td>{i.min_qty}</td>
                  <td>{i.expiry_date || "-"}</td>
                  <td>{i.category}</td>
                  <td>{i.location}</td>
                  <td>
                    <button onClick={() => startEditing(i)} style={styles.smallBtn}>Edit</button>
                    <button onClick={() => deleteItem(i.item_id)} style={styles.smallBtn}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------
// Minimal styling
// ------------------------------
const styles = {
  box: {
    padding: 15,
    marginBottom: 25,
    border: "1px solid #ccc",
    borderRadius: 8,
    maxWidth: 600
  },
  input: {
    display: "block",
    marginTop: 8,
    padding: 6,
    width: "100%"
  },
  btn: {
    marginTop: 12,
    padding: "8px 14px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  smallBtn: {
    marginLeft: 8,
    padding: "5px 8px",
    background: "#eee",
    border: "1px solid #ccc",
    borderRadius: 4,
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};
