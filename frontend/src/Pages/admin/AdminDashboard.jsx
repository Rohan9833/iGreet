import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleDashed, CreditCard, QrCode, Stethoscope, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminDashboard, getQrImageUrl } from "../../api/admin.api";

const StatCard = ({ label, value, helper, icon: Icon, iconClass }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(24,45,69,0.04)]">
    <div className={["flex h-11 w-11 items-center justify-center rounded-xl", iconClass].join(" ")}><Icon className="h-5 w-5" /></div>
    <p className="mt-5 text-[13px] font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-[30px] font-bold tracking-[-1px] text-[#11233d]">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{helper}</p>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    getAdminDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedQr(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const stats = data?.stats;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-[#11233d] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-500/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-300">MediGreetings Control Center</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.6px] sm:text-3xl">Manage your QR and doctor network</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Monitor QR assignments, doctors, MRs and content activity from one place.</p>
          <Link to="/admin/qr-codes" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-400">
            Manage QR codes <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total QR codes" value={stats?.totalQRCodes ?? "—"} helper="Generated QR inventory" icon={QrCode} iconClass="bg-orange-50 text-orange-500" />
        <StatCard label="Assigned" value={stats?.assignedQRCodes ?? "—"} helper="Currently linked to doctors" icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-600" />
        <StatCard label="Available" value={stats?.availableQRCodes ?? "—"} helper="Ready for a new doctor" icon={CircleDashed} iconClass="bg-blue-50 text-blue-600" />
        <StatCard label="Doctors" value={stats?.totalDoctors ?? "—"} helper="Doctors in the system" icon={Stethoscope} iconClass="bg-violet-50 text-violet-600" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h3 className="font-bold text-[#11233d]">Recent QR activity</h3><p className="mt-0.5 text-xs text-slate-400">Latest QR records</p></div>
            <Link to="/admin/qr-codes" className="text-xs font-bold text-orange-500">View all</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {!data?.recentQRCodes?.length && <div className="px-5 py-12 text-center text-sm text-slate-400">No QR codes have been generated yet.</div>}
            {data?.recentQRCodes?.map((qr) => {
              const imageUrl = getQrImageUrl(qr.imageFileName || qr.imageUrl);

              return (
                <div key={qr._id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => imageUrl && setSelectedQr(qr)}
                      disabled={!imageUrl}
                      title="Click to view QR"
                      className="group h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-sm transition hover:border-orange-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`QR code ${qr.code}`}
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50">
                          <QrCode className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-700">{qr.code}</p>
                      <p className="truncate text-xs text-slate-400">{qr.doctor?.doctorName || "Not assigned"}</p>
                    </div>
                  </div>
                  <span className={qr.status === "assigned" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600" : "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500"}>
                    {qr.status === "unassigned" ? "Available" : qr.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-[#11233d]">Platform overview</h3>
          <div className="mt-5 space-y-3">
            {[
              ["MR network", stats?.totalMRs ?? "—", UsersRound],
              ["Generations", stats?.totalGenerations ?? "—", BarChartIcon],
              ["Credits used", stats?.creditsUsed ?? "—", CreditCard],
              ["Active doctors", stats?.activeDoctors ?? "—", Stethoscope],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="flex-1 text-sm text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedQr && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-5 backdrop-blur-sm"
          onClick={() => setSelectedQr(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-[620px] items-center justify-center rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={getQrImageUrl(selectedQr.imageFileName || selectedQr.imageUrl)}
              alt={`QR code ${selectedQr.code}`}
              className="max-h-[78vh] w-full max-w-[520px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function BarChartIcon(props) {
  return <span className="inline-flex h-4 w-4 items-center justify-center text-slate-500" {...props}>▥</span>;
}
