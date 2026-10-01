import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Stethoscope,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "QR Codes", to: "/admin/qr-codes", icon: QrCode },
  { label: "Doctors", to: "/admin/doctors", icon: Stethoscope },
  { label: "MRs", to: "/admin/mrs", icon: UsersRound },
  { label: "Generations", to: "/admin/generations", icon: BarChart3 },
];

const pageTitles = {
  "/admin": ["Dashboard", "Overview of your iGreet platform"],
  "/admin/qr-codes": ["QR Codes", "Generate, monitor and manage QR assignments"],
  "/admin/doctors": ["Doctors", "View doctors connected to iGreet"],
  "/admin/mrs": ["MRs", "View your field-force hierarchy and activity"],
  "/admin/generations": ["Generations", "Monitor doctor creations and credit usage"],
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const current =
    pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(
      ([path]) => path !== "/admin" && location.pathname.startsWith(path),
    )?.[1] ||
    pageTitles["/admin"];

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#11233d]">
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 grid-cols-2 grid-rows-2 gap-1">
              <span className="rounded-[4px] bg-orange-400" />
              <span className="rounded-[4px] bg-orange-400" />
              <span className="rounded-[4px] bg-orange-500" />
              <span className="rounded-[4px] bg-orange-500" />
            </div>
            <span className="text-[24px] font-bold tracking-[-1px]">
              <span className="text-orange-500">i</span>Greet
            </span>
          </div>

          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Management
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold transition",
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={["h-[19px] w-[19px]", isActive ? "text-orange-500" : "text-slate-400"].join(" ")} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 text-orange-400" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <CircleUserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">Administrator</p>
              <p className="text-[11px] text-slate-400">iGreet Admin</p>
            </div>
          </div>

          <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800">
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[255px]">
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[#11233d] sm:text-[23px]">
                {current[0]}
              </h1>
              <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">{current[1]}</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 sm:flex">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">System active</span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
