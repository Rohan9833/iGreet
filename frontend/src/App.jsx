import "./App.css";
import MrForm from "./Pages/MrForm";
import MrLogin from "./Pages/MrLogin";
import Drcreate from "./Pages/Drcreate";
import QRScan from "./Pages/QRScan";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/qr/:token" element={<QRScan />} />
      <Route path="/mr-login" element={<MrLogin />} />
      <Route path="/register-doctor" element={<MrForm />} />
      <Route path="/doctor" element={<Drcreate />} />
    </Routes>
  );
}

export default App;
