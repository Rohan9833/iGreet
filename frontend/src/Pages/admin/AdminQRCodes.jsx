import { useEffect, useMemo, useState } from "react";
import { Download, Filter, Plus, QrCode, Search, X } from "lucide-react";
import { getAdminQRCodes } from "../../api/admin.api";

const statusStyles = {
  assigned: "bg-emerald-50 text-emerald-600",
  unassigned: "bg-slate-100 text-slate-600",
  disabled: "bg-red-50 text-red-500",
};

export default function AdminQRCodes() {
  const [qrs, setQrs] = useState([]);
  const [quantity, setQuantity] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminQRCodes().then(setQrs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return qrs.filter((qr) => {
      const matchesSearch =
        !search ||
        qr.code?.toLowerCase().includes(search.toLowerCase()) ||
        qr.token?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "all" || qr.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [qrs, search, status]);

  const downloadQr = (qr) => {
    if (!qr.imageUrl) return;
    const link = document.createElement("a");
    link.href = qr.imageUrl;
    link.download = `${qr.code || "igreet-qr"}.png`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-[#11233d]">QR inventory</h2>
          <p className="mt-1 text-sm text-slate-400">
            {qrs.length} QR codes in your current inventory
          </p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(249,115,22,0.18)] hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" />
          Generate QR codes
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by QR code or token..."
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
          />
        </div>
        <div className="relative">
          <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-600 outline-none md:w-[180px]"
          >
            <option value="all">All statuses</option>
            <option value="unassigned">Available</option>
            <option value="assigned">Assigned</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-4">QR code</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Assigned</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-sm text-slate-400">
                    No QR codes match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((qr) => (
                <tr key={qr.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                        <QrCode className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{qr.code}</p>
                        <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-slate-400">{qr.token}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={["rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", statusStyles[qr.status] || statusStyles.unassigned].join(" ")}>
                      {qr.status === "unassigned" ? "Available" : qr.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {qr.doctor ? "Assigned doctor" : "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {qr.assignedAt ? new Date(qr.assignedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => downloadQr(qr)}
                      disabled={!qr.imageUrl}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PNG
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-5">
          <div className="w-full max-w-[430px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#11233d]">Generate QR codes</h3>
                <p className="mt-1 text-sm text-slate-400">Create a new batch for distribution.</p>
              </div>
              <button onClick={() => setShowGenerate(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-6 block text-sm font-semibold text-slate-700">
              Quantity
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <button
              onClick={() => alert("QR generation API is ready at POST /api/qr/generate. Connect this action when the admin backend endpoint is exposed.")}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white hover:bg-orange-400"
            >
              <QrCode className="h-4 w-4" />
              Generate {quantity || 0} QR codes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
