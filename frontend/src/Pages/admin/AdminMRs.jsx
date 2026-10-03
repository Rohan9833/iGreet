import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getAdminMRs } from "../../api/admin.api";

const PAGE_SIZE = 25;

export default function AdminMRs() {
  const [search, setSearch] = useState("");
  const [mrs, setMrs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = async (value = search, nextPage = 1) => {
    setLoading(true);

    try {
      const result = await getAdminMRs(value, nextPage, PAGE_SIZE);
      setMrs(result.mrs);
      setPagination(result.pagination);
    } catch (error) {
      setMrs([]);
      setPagination({
        page: nextPage,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 0,
      });
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("", 1);
  }, []);

  const handleSearch = () => {
    load(search, 1);
  };

  const goToPage = (page) => {
    if (loading || page < 1 || page > pagination.totalPages) return;
    load(search, page);
  };

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;

  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#11233d]">MR network</h2>
        <p className="mt-1 text-sm text-slate-400">
          TLM → SLM → FLM → MR hierarchy.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search MR ID or name..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="rounded-xl bg-orange-500 px-5 text-sm font-bold text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Search
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">MR</th>
                <th className="px-5 py-4">FLM</th>
                <th className="px-5 py-4">SLM</th>
                <th className="px-5 py-4">TLM</th>
                <th className="px-5 py-4">HQ / Region</th>
                <th className="px-5 py-4">Doctors</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-sm text-slate-400">
                    Loading MR network...
                  </td>
                </tr>
              )}

              {!loading && !mrs.length && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-sm text-slate-400">
                    No MRs found.
                  </td>
                </tr>
              )}

              {!loading &&
                mrs.map((mr) => (
                  <tr key={mr._id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-700">{mr.mrName}</p>
                      <p className="text-xs text-slate-400">{mr.mrId}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {mr.flm?.flmName || "—"}
                      <span className="block text-xs text-slate-400">{mr.flm?.flmId || ""}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {mr.flm?.slm?.slmName || "—"}
                      <span className="block text-xs text-slate-400">{mr.flm?.slm?.slmId || ""}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {mr.flm?.slm?.tlm?.tlmName || "—"}
                      <span className="block text-xs text-slate-400">{mr.flm?.slm?.tlm?.tlmId || ""}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {mr.hq || "—"}
                      <span className="block text-xs text-slate-400">{mr.region || "—"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[#11233d]">
                      {mr.doctors?.length || 0}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!loading && pagination.total > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-bold text-slate-600">{firstItem}</span>–
              <span className="font-bold text-slate-600">{lastItem}</span> of{" "}
              <span className="font-bold text-slate-600">{pagination.total}</span> MRs
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={loading || pagination.page <= 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="min-w-[90px] text-center text-xs font-bold text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={loading || pagination.page >= pagination.totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="hidden" />
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
