import { useEffect, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import { getAdminMRs } from "../../api/admin.api";

export default function AdminMRs() {
  const [search, setSearch] = useState("");
  const [mrs, setMrs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (value = search) => {
    setLoading(true);
    try { setMrs(await getAdminMRs(value)); } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(""); }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="text-lg font-bold text-[#11233d]">MR network</h2><p className="mt-1 text-sm text-slate-400">TLM → SLM → FLM → MR hierarchy.</p></div>
      <div className="flex gap-3">
        <div className="relative max-w-xl flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search MR ID or name..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /></div>
        <button onClick={() => load()} className="rounded-xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-400">Search</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">MR</th><th className="px-5 py-4">FLM</th><th className="px-5 py-4">SLM</th><th className="px-5 py-4">TLM</th><th className="px-5 py-4">HQ / Region</th><th className="px-5 py-4">Doctors</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan="6" className="px-5 py-16 text-center text-sm text-slate-400">Loading MR network...</td></tr>}
              {!loading && !mrs.length && <tr><td colSpan="6" className="px-5 py-16 text-center text-sm text-slate-400">No MRs found.</td></tr>}
              {!loading && mrs.map((mr) => (
                <tr key={mr._id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4"><p className="text-sm font-bold text-slate-700">{mr.mrName}</p><p className="text-xs text-slate-400">{mr.mrId}</p></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{mr.flm?.flmName || "—"}<span className="block text-xs text-slate-400">{mr.flm?.flmId || ""}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{mr.flm?.slm?.slmName || "—"}<span className="block text-xs text-slate-400">{mr.flm?.slm?.slmId || ""}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{mr.flm?.slm?.tlm?.tlmName || "—"}<span className="block text-xs text-slate-400">{mr.flm?.slm?.tlm?.tlmId || ""}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-500">{mr.hq || "—"}<span className="block text-xs text-slate-400">{mr.region || "—"}</span></td>
                  <td className="px-5 py-4 text-sm font-bold text-[#11233d]">{mr.doctors?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
