import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { loginMr } from "../api/mrAuth.api";

const Logo = () => (
  <div className="flex items-center justify-center gap-3">
    <div className="relative h-10 w-10">
      <span className="absolute left-0 top-3 h-4 w-4 rounded-[5px] bg-orange-400" />
      <span className="absolute left-3 top-0 h-4 w-4 rounded-[5px] bg-orange-400" />
      <span className="absolute left-6 top-3 h-4 w-4 rounded-[5px] bg-orange-500" />
      <span className="absolute left-3 top-6 h-4 w-4 rounded-[5px] bg-orange-500" />
    </div>
    <div className="text-[30px] font-bold tracking-[-1.2px] text-slate-900">
      <span className="text-orange-500">i</span>Greet
    </div>
  </div>
);

export default function MrLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";

  const [mrId, setMrId] = useState("");
  const [mrPassword, setMrPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!qrToken) {
      setError("This login page was not opened from a valid QR code.");
      return;
    }

    if (!mrId.trim() || !mrPassword) {
      setError("Enter your MR ID and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await loginMr({
        mrId: mrId.trim(),
        mrPassword,
      });

      navigate(`/register-doctor?qrToken=${encodeURIComponent(qrToken)}`, {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafb] px-4 py-8 font-sans">
      <div className="pointer-events-none absolute -left-32 top-12 h-64 w-64 rounded-full bg-orange-50" />
      <div className="pointer-events-none absolute -right-32 bottom-8 h-72 w-72 rounded-full bg-orange-50" />

      <section className="relative z-10 w-full max-w-[470px] rounded-[28px] bg-white px-6 py-8 shadow-[0_24px_70px_rgba(24,45,69,0.10),0_4px_20px_rgba(24,45,69,0.04)] sm:px-10 sm:py-10">
        <Logo />

        <div className="mt-8 text-center">
          <h1 className="text-[30px] font-bold tracking-[-0.8px] text-[#11233d]">
            MR Login
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Login with your existing MR credentials to assign this QR to a
            doctor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#213653]">
              MR ID
            </label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={mrId}
                onChange={(event) => setMrId(event.target.value)}
                placeholder="Enter your MR ID"
                autoComplete="username"
                className="h-14 w-full rounded-[13px] border border-slate-300 bg-white pl-12 pr-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#213653]">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={mrPassword}
                onChange={(event) => setMrPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-14 w-full rounded-[13px] border border-slate-300 bg-white pl-12 pr-12 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-[12px] border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-orange-500 to-orange-400 text-base font-bold text-white shadow-[0_9px_24px_rgba(255,116,51,0.20)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_28px_rgba(255,116,51,0.27)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSubmitting ? "Logging in..." : "Login to Continue"}</span>
            {!isSubmitting && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Your MR account is provided by the MediGreetings hierarchy system.
        </p>
      </section>
    </main>
  );
}
