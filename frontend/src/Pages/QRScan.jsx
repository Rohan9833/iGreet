import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { getQRByToken } from "../api/qr.api";

export default function QRScan() {
  const { token } = useParams();
  const navigate = useNavigate();
  const checkedToken = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || checkedToken.current === token) {
      return;
    }

    checkedToken.current = token;

    const checkQR = async () => {
      try {
        setError("");

        const qr = await getQRByToken(token);

        if (qr.status === "unassigned") {
          navigate(`/register-doctor?qrToken=${encodeURIComponent(token)}`, {
            replace: true,
          });
          return;
        }

        if (qr.status === "assigned" && qr.doctor) {
          navigate(`/doctor?qrToken=${encodeURIComponent(token)}`, {
            replace: true,
          });
          return;
        }

        if (qr.status === "disabled") {
          setError("This QR code has been disabled.");
          return;
        }

        setError("This QR code has an invalid assignment state.");
      } catch (requestError) {
        console.error("QR verification failed:", requestError);
        setError(
          requestError.message || "Unable to verify this QR code. Please try again."
        );
      }
    };

    checkQR();
  }, [navigate, token]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafb] px-5">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-[0_20px_60px_rgba(24,45,69,0.10)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-[#11233d]">
            QR verification failed
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafb]">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <LoaderCircle className="h-7 w-7 animate-spin" />
        </div>

        <h1 className="mt-5 text-lg font-semibold text-[#11233d]">
          Checking your QR code...
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Please wait a moment.
        </p>
      </div>
    </main>
  );
}
