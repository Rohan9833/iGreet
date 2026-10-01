import { Search, UsersRound } from "lucide-react";
import { useState } from "react";

export default function AdminMRs() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#11233d]">MR network</h2>
        <p className="mt-1 text-sm text-slate-400">TLM → SLM → FLM → MR hierarchy.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search MR ID or name..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UsersRound className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-base font-bold text-[#11233d]">Hierarchy API not connected yet</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            Your MR records already exist in MongoDB. This admin view is prepared for the hierarchy list endpoint.
          </p>
        </div>
      </div>
    </div>
  );
}
