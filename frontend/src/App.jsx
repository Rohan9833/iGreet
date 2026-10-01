import "./App.css";
import MrForm from "./Pages/MrForm";
import Drcreate from "./Pages/Drcreate";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        {/* MR scans an unassigned QR */}
        <Route path="/register-doctor" element={<MrForm />} />

        {/* Doctor scans an already assigned QR */}
        <Route path="/doctor" element={<Drcreate />} />
      </Routes>
    </>
  );
}

export default App;
