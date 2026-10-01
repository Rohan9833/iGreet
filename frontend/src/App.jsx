import "./App.css";
import MrForm from "./Pages/MrForm";
import Drcreate from "./Pages/Drcreate";
import QRScan from "./Pages/QRScan";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      {/* QR decides whether this visitor goes to MR or Doctor side */}
      <Route path="/qr/:token" element={<QRScan />} />

      {/* MR scans an unassigned QR */}
      <Route path="/register-doctor" element={<MrForm />} />

      {/* Doctor scans an already assigned QR */}
      <Route path="/doctor" element={<Drcreate />} />
    </Routes>
  );
}

export default App;
