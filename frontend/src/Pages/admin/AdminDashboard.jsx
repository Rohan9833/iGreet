import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  QrCode,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminQRCodes } from "../../api/admin.api";

const StatCard = ({ label, value, helper, icon: Icon, iconClass }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(24,45,69,0.04)]">
    <div className="flex items-start justify-between">
      <div className={["flex h-11 w-11 items-center justify-center rounded-xl", iconClass].join(" ")}>
        <Icon className="h-5 w-5" />
      </div>
      <ArrowUpRight className="h-4 w-4 text-slate-300" />
    </div>
    <p className="mt-5 text-[13px] font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-[30px] font-bold tracking-[-1px] text-[#11233d]">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{helper}</p>
  </div>
);

export default function AdminDashboard() {
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminQRCodes()
      .then(setQrs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const assigned = qrs.filter((qr) => qr.status === "assigned").length;
    const available = qrs.filter((qr) => qr.status === "unassigned").length;
    const doctors = new Set(
      qrs.filter((qr) => qr.doctor).map((qr) => String(qr.doctor)),
    ).size;

    return { total: qrs.length, assigned, available, doctors };
  }, [qrs]);

  const recent = qrs.slice(0, 6);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-[#11233d] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/10" />
        <div className="pointer-events-none absolute -bottom-32 right-24 h-64 w-64 rounded-full bg-orange-400/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
            iGreet Control Center
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.6px] sm:text-3xl">
            Manage your QR and doctor network
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Monitor QR assignments, doctors, MRs and content activity from one place.
          </p>
          <Link
            to="/admin/qr-codes"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400"
          >
            Manage QR codes
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total QR codes" value={loading ? "—" : stats.total} helper="Generated QR inventory" icon={QrCode} iconClass="bg-orange-50 text-orange-500" />
        <StatCard label="Assigned" value={loading ? "—" : stats.assigned} helper="Currently linked to doctors" icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-600" />
        <StatCard label="Available" value={loading ? "—" : stats.available} helper="Ready for a new doctor" icon={CircleDashed} iconClass="bg-blue-50 text-blue-600" />
        <StatCard label="Doctors" value={loading ? "—" : stats.doctors} helper="Unique QR-linked doctors" icon={Stethoscope} iconClass="bg-violet-50 text-violet-600" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="font-bold text-[#11233d]">Recent QR activity</h3>
              <p className="mt-0.5 text-xs text-slate-400">Latest QR records</p>
            </div>
            <Link to="/admin/qr-codes" className="text-xs font-bold text-orange-500 hover:text-orange-600">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && recent.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-slate-400">
                No QR codes have been generated yet.
              </div>
            )}

            {recent.map((qr) => (
              <div key={qr.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <QrCode className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-700">{qr.code}</p>
                    <p className="text-xs text-slate-400">
                      {qr.createdAt ? new Date(qr.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <span className={qr.status === "assigned" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600" : "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500"}>
                  {qr.status === "assigned" ? "Assigned" : "Available"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-[#11233d]">Platform overview</h3>
          <div className="mt-5 space-y-4">
            {[
              ["QR inventory", stats.total, QrCode],
              ["Doctor links", stats.doctors, Stethoscope],
              ["MR network", "—", UsersRound],
              ["Credits used", "—", CreditCard],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="flex-1 text-sm text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-400">
            MR and generation metrics will populate when their admin APIs are connected.
          </p>
        </div>
      </section>
    </div>
  );
}
