import React, { useEffect, useState } from "react";

export default function Report() {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [days, setDays] = useState(7);

  const API = "http://127.0.0.1:5000";

  // Fetch static report sections on page load
  useEffect(() => {
    fetch(`${API}/report/summary`).then(r => r.json()).then(setSummary);
    fetch(`${API}/report/low-stock`).then(r => r.json()).then(setLowStock);
    fetch(`${API}/report/by-category`).then(r => r.json()).then(setByCategory);
    fetch(`${API}/report/by-location`).then(r => r.json()).then(setByLocation);
  }, []);

  // Reload expiring items when "days" changes
  useEffect(() => {
    fetch(`${API}/report/expiring?days=${days}`)
      .then(r => r.json())
      .then(setExpiring);
  }, [days]);

  if (!summary) return <div style={{ padding: 20 }}>Loading reports...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={styles.title}>Pantry Report</h1>

      {/* Summary Cards */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h2 style={styles.cardNumber}>{summary.total_items}</h2>
          <p>Total Items</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardNumber}>{summary.low_stock}</h2>
          <p>Items Below Min Qty</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardNumber}>{summary.expiring}</h2>
          <p>Items With Expiry Dates</p>
        </div>
      </div>

      {/* Expiring Soon */}
      <div style={styles.section}>
        <h2>Expiring Soon</h2>

        <div>
          <label>Show items expiring in next: </label>
          <select
            value={days}
            onChange={e => setDays(e.target.value)}
            style={styles.dropdown}
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        {expiring.length === 0 ? (
          <p style={{ marginTop: 10 }}>No items expiring soon.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {expiring.map((e, idx) => (
                <tr key={idx}>
                  <td>{e.item_name}</td>
                  <td>{e.category}</td>
                  <td>{e.expiry_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Low Stock */}
      <div style={styles.section}>
        <h2>Low Stock Items</h2>
        {lowStock.length === 0 ? (
          <p>No low-stock items 🎉</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Location</th>
                <th>Qty</th>
                <th>Min Qty</th>
                <th>Shortage</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.item_name}</td>
                  <td>{i.category}</td>
                  <td>{i.location}</td>
                  <td>{i.qty}</td>
                  <td>{i.min_qty}</td>
                  <td>{i.shortage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Breakdown */}
      <div style={styles.section}>
        <h2>Items by Category</h2>

        {byCategory.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Items</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.category}</td>
                  <td>{row.total_items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Location Breakdown */}
      <div style={styles.section}>
        <h2>Items by Location</h2>

        {byLocation.length === 0 ? (
          <p>No locations found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Total Items</th>
              </tr>
            </thead>
            <tbody>
              {byLocation.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.location}</td>
                  <td>{row.total_items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Styles
const styles = {
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20
  },
  section: {
    marginTop: 40
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
    background: "#fafafa"
  },
  dropdown: {
    marginTop: 10,
    padding: 6
  },
  cardContainer: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginTop: 10
  },
  card: {
    background: "#f4f4f4",
    padding: 20,
    borderRadius: 8,
    width: 200,
    textAlign: "center",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
  },
  cardNumber: {
    fontSize: 28,
    margin: 0
  }
};
