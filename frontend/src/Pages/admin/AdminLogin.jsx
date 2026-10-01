import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/adminAuth.api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin({ loginId, password });
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-5 py-10">
      <div className="w-full max-w-[430px]">
        <div className="mb-7 text-center">
          <div className="mx-auto flex w-fit items-center gap-2.5">
            <div className="grid h-9 w-9 grid-cols-2 grid-rows-2 gap-1">
              <span className="rounded-[4px] bg-orange-400" /><span className="rounded-[4px] bg-orange-400" />
              <span className="rounded-[4px] bg-orange-500" /><span className="rounded-[4px] bg-orange-500" />
            </div>
            <span className="text-[28px] font-bold tracking-[-1px]"><span className="text-orange-500">i</span>Greet</span>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Management portal</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(24,45,69,0.08)] sm:p-9">
          <h1 className="text-2xl font-bold text-[#11233d]">Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Sign in using your existing TLM, SLM or FLM credentials.</p>

          <label className="mt-7 block text-sm font-semibold text-slate-700">TLM / SLM / FLM ID</label>
          <div className="relative mt-2">
            <UserRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={loginId} onChange={(e) => setLoginId(e.target.value)} autoComplete="username" placeholder="Enter your ID" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" required />
          </div>

          <label className="mt-5 block text-sm font-semibold text-slate-700">Password</label>
          <div className="relative mt-2">
            <LockKeyhole className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-12 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>

          {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <button disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white shadow-[0_8px_20px_rgba(249,115,22,0.18)] hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60">
            <LogIn className="h-4 w-4" />{loading ? "Signing in..." : "Sign in to Admin Panel"}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">MR accounts cannot access this portal.</p>
        </form>
      </div>
    </div>
  );
}
