import { useEffect, useState } from "react";
import { BarChart3, CreditCard, ImageIcon, Search } from "lucide-react";
import { getAdminGenerations } from "../../api/admin.api";

export default function AdminGenerations() {
  const [search, setSearch] = useState("");
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (value = search) => {
    setLoading(true);
    try { setGenerations(await getAdminGenerations(value)); } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(""); }, []);

  const credits = generations.reduce((sum, item) => sum + Number(item.creditsUsed || 0), 0);

  return (
    <div className="space-y-6">
      <div><h2 className="text-lg font-bold text-[#11233d]">Generation activity</h2><p className="mt-1 text-sm text-slate-400">Track doctor creations and credit usage.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {[["Total generations", generations.length, BarChart3], ["Credits in loaded records", credits, CreditCard], ["Active creators", new Set(generations.map((g) => String(g.doctor?._id))).size, ImageIcon]].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold text-[#11233d]">{value}</p></div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="relative max-w-xl flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search doctor, code or speciality..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" /></div><button onClick={() => load()} className="rounded-xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-400">Search</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Doctor</th><th className="px-5 py-4">MR</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Template</th><th className="px-5 py-4">Credits</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th></tr></thead><tbody className="divide-y divide-slate-100">
          {loading && <tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-slate-400">Loading generations...</td></tr>}
          {!loading && !generations.length && <tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-slate-400">No generation records yet.</td></tr>}
          {!loading && generations.map((item) => <tr key={item._id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="text-sm font-bold text-slate-700">{item.doctor?.doctorName || "—"}</p><p className="text-xs text-slate-400">{item.doctor?.doctorCode || ""}</p></td><td className="px-5 py-4 text-sm text-slate-500">{item.mr?.mrName || item.mr?.mrId || "—"}</td><td className="px-5 py-4 text-sm text-slate-600">{item.type || "—"}</td><td className="px-5 py-4 text-sm text-slate-600">{item.template || "—"}</td><td className="px-5 py-4 text-sm font-bold text-[#11233d]">{item.creditsUsed || 0}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">{item.status}</span></td><td className="px-5 py-4 text-sm text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td></tr>)}
        </tbody></table></div>
      </div>
    </div>
  );
}
