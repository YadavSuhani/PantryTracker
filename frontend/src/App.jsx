import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ItemsPage from "./pages/ItemsPage";
import ReportPage from "./pages/ReportPage";
import "./index.css";

export default function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="nav-title">Pantry Tracker</div>
        <div className="nav-links">
          <Link to="/">Manage Items</Link>
          <Link to="/report">Report</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<ItemsPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}
