import { ArrowLeft, CalendarDays, Coins, FileImage, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDoctorByQRToken, getDoctorGenerationsByQRToken } from "../api/doctor.api";

const titleFromTemplate = (template = "") =>
  template
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export default function DoctorGenerations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";
  const [doctor, setDoctor] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState(null);

  useEffect(() => {
    if (!qrToken) {
      setError("No QR code was provided.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const [doctorData, generationData] = await Promise.all([
          getDoctorByQRToken(qrToken),
          getDoctorGenerationsByQRToken(qrToken),
        ]);

        setDoctor(doctorData.doctor);
        setGenerations(generationData.generations || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load generations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [qrToken]);

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-4 py-5 font-sans text-[#10233f] sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-[900px]">
        <button
          type="button"
          onClick={() => navigate(`/doctor?qrToken=${encodeURIComponent(qrToken)}`)}
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#52627a] shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="rounded-[28px] bg-white p-5 shadow-[0_15px_50px_rgba(25,45,70,0.07)] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff3e8] px-3 py-1.5 text-[11px] font-bold text-orange-600">
                <Sparkles className="h-3.5 w-3.5" />
                Your Generations
              </div>
              <h1 className="text-[28px] font-bold tracking-[-1px] sm:text-[34px]">
                View Generations
              </h1>
              <p className="mt-1 text-[14px] text-[#718198]">
                {doctor?.doctorName ? `Cards created for Dr. ${doctor.doctorName}.` : "Your created cards appear here."}
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-orange-100 bg-[#fff8f1] px-4 py-3 text-right">
              <p className="text-[11px] font-semibold text-[#718198]">Credits left</p>
              <p className="mt-0.5 text-[17px] font-bold text-orange-600">
                {doctor?.credits ?? "--"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[14px] text-[#718198]">
              Loading your generations...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-[13px] text-red-600">
              {error}
            </div>
          ) : generations.length === 0 ? (
            <div className="mt-6 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                <FileImage className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-[18px] font-bold">No generations yet</h2>
              <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] leading-[1.5] text-[#718198]">
                Your personalized cards will appear here after you create them.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/doctor/templates?qrToken=${encodeURIComponent(qrToken)}`)}
                className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Create a personalized card
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {generations.map((generation) => {
                const receiverName = generation.metadata?.receiverName || "Personalized card";
                return (
                  <button
                    key={generation._id}
                    type="button"
                    onClick={() => setSelectedGeneration(generation)}
                    className="flex w-full flex-col gap-4 rounded-[20px] border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-orange-100 hover:bg-[#fffaf5] sm:flex-row sm:items-center"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white shadow-sm">
                      {generation.outputUrl ? (
                        <img
                          src={generation.outputUrl}
                          alt={receiverName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={
                            generation.template === "teachers-day"
                              ? "/teachersday.png"
                              : generation.template === "independence-day"
                                ? "/independence.png"
                                : generation.template === "dussehra"
                                  ? "/dussehra.png"
                                  : "/anniversary.png"
                          }
                          alt={titleFromTemplate(generation.template)}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[16px] font-bold">
                        {titleFromTemplate(generation.template)}
                      </h2>
                      <p className="mt-1 text-[13px] text-[#52627a]">
                        For <span className="font-semibold">{receiverName}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#718198]">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(generation.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {generation.creditsUsed} credits
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold capitalize text-emerald-600">
                      {generation.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {selectedGeneration && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#10233f]/60 p-4 backdrop-blur-sm"
              onClick={() => setSelectedGeneration(null)}
            >
              <div
                className="w-full max-w-[520px] overflow-hidden rounded-[26px] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h2 className="text-[18px] font-bold">
                      {titleFromTemplate(selectedGeneration.template)}
                    </h2>
                    <p className="mt-0.5 text-[12px] text-[#718198]">
                      {selectedGeneration.metadata?.receiverName || "Personalized card"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGeneration(null)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-slate-50 p-5">
                  {selectedGeneration.outputUrl ? (
                    <img
                      src={selectedGeneration.outputUrl}
                      alt={selectedGeneration.metadata?.receiverName || "Generated card"}
                      className="mx-auto max-h-[65vh] w-auto max-w-full rounded-xl shadow-md"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl bg-white text-sm text-slate-500">
                      Generated file is unavailable.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="text-[11px] text-[#718198]">
                    Created {formatDate(selectedGeneration.createdAt)}
                  </div>
                  {selectedGeneration.outputUrl && (
                    <a
                      href={selectedGeneration.outputUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-full bg-orange-500 px-4 py-2 text-[12px] font-semibold text-white"
                    >
                      Download Card
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
