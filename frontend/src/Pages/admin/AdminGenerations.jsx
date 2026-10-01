import { BarChart3, CreditCard, ImageIcon } from "lucide-react";

export default function AdminGenerations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#11233d]">Generation activity</h2>
        <p className="mt-1 text-sm text-slate-400">Track doctor creations and credit usage.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Total generations", "—", BarChart3],
          ["Credits consumed", "—", CreditCard],
          ["Active creators", "—", ImageIcon],
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[#11233d]">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <BarChart3 className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-base font-bold text-[#11233d]">Generation API not connected yet</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
          The admin screen is ready for generation history, credit deductions and doctor-level activity once those backend records are exposed.
        </p>
      </div>
    </div>
  );
}
