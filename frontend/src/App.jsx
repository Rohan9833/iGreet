import "./App.css";
import MrForm from "./Pages/MrForm";
import Drcreate from "./Pages/Drcreate";
import QRScan from "./Pages/QRScan";
import MrLogin from "./Pages/MrLogin";
import AdminLayout from "./Pages/admin/AdminLayout";
import AdminDashboard from "./Pages/admin/AdminDashboard";
import AdminQRCodes from "./Pages/admin/AdminQRCodes";
import AdminDoctors from "./Pages/admin/AdminDoctors";
import AdminMRs from "./Pages/admin/AdminMRs";
import AdminGenerations from "./Pages/admin/AdminGenerations";
import AdminLogin from "./Pages/admin/AdminLogin";
import AdminProtectedRoute from "./Pages/admin/AdminProtectedRoute";
import DoctorTemplates from "./Pages/DoctorTemplates";
import DoctorGenerations from "./Pages/DoctorGenerations";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/qr/:token" element={<QRScan />} />
      <Route path="/register-doctor" element={<MrForm />} />
      <Route path="/doctor" element={<Drcreate />} />
      <Route path="/doctor/templates" element={<DoctorTemplates />} />
      <Route path="/doctor/generations" element={<DoctorGenerations />} />
      <Route path="/mr-login" element={<MrLogin />} />

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="qr-codes" element={<AdminQRCodes />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="mrs" element={<AdminMRs />} />
          <Route path="generations" element={<AdminGenerations />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
