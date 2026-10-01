import { useEffect, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { getAdminDoctors } from "../../api/admin.api";

export default function AdminDoctors() {
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (value = search) => {
    setLoading(true);
    try { setDoctors(await getAdminDoctors(value)); } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(""); }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="text-lg font-bold text-[#11233d]">Doctor directory</h2><p className="mt-1 text-sm text-slate-400">{doctors.length} doctors in the system.</p></div>
      <div className="flex gap-3">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search doctor, code or speciality..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" />
        </div>
        <button onClick={() => load()} className="rounded-xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-400">Search</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr><th className="px-5 py-4">Doctor</th><th className="px-5 py-4">Speciality</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">QR</th><th className="px-5 py-4">MR</th><th className="px-5 py-4">Credits</th><th className="px-5 py-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-slate-400">Loading doctors...</td></tr>}
              {!loading && !doctors.length && <tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-slate-400">No doctors found.</td></tr>}
              {!loading && doctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4"><p className="text-sm font-bold text-slate-700">{doctor.doctorName}</p><p className="text-xs text-slate-400">{doctor.doctorCode}</p></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{doctor.speciality}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{[doctor.area, doctor.city].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">{doctor.qr?.code || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{doctor.qr?.assignedByMr?.mrName || doctor.qr?.assignedByMr?.mrId || "—"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-[#11233d]">{doctor.credits ?? 0}</td>
                  <td className="px-5 py-4"><span className={doctor.status === "active" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600" : "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500"}>{doctor.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
