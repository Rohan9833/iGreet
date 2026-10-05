import { ArrowLeft, CalendarDays, ChevronDown, Coins, Download, Eye, FileImage, Film, Play, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  downloadDoctorGeneration,
  fetchGenerationBlobUrl,
  getDoctorByQRToken,
  getDoctorGenerationsByQRToken,
} from "../api/doctor.api";

const TEMPLATE_NAMES = {
  "teachers-day": "Teachers Day",
  "independence-day": "Independence Day",
  dussehra: "Dussehra",
  anniversary: "Anniversary",
  "nash-doctor-intro": "NASH Doctor Intro",
  "kidney-doctor-intro": "Kidney Day Doctor Intro",
  "epilepsy-doctor-intro": "Epilepsy Doctor Intro",
};

const TEMPLATE_IMAGES = {
  "teachers-day": "/teachersday.png",
  "independence-day": "/independence.png",
  dussehra: "/dussehra.png",
  anniversary: "/anniversary.png",
};

const titleFromTemplate = (template = "") =>
  TEMPLATE_NAMES[template] ||
  template
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDate = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const fallbackTemplateImage = (template) => TEMPLATE_IMAGES[template] || "";

const isVideoGeneration = (generation) =>
  generation?.type === "greeting-video" ||
  [
    "nash-doctor-intro",
    "kidney-doctor-intro",
    "epilepsy-doctor-intro",
  ].includes(generation?.template);

const getReceiverName = (generation) =>
  generation?.metadata?.receiverName ||
  generation?.metadata?.name ||
  generation?.metadata?.doctorName ||
  "Personalized greeting";

export default function DoctorGenerations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";
  const [doctor, setDoctor] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState(null);
  const [expandedGenerationId, setExpandedGenerationId] = useState(null);
  const [generationImageUrls, setGenerationImageUrls] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const generationImageUrlsRef = useRef({});

  useEffect(() => {
    generationImageUrlsRef.current = generationImageUrls;
  }, [generationImageUrls]);

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
        const nextGenerations = generationData.generations || [];
        setGenerations(nextGenerations);

        // Load the actual files through the backend API so browser image
        // requests do not depend on the static/ngrok image URL.
        await Promise.all(
          nextGenerations.map((generation) => resolveGenerationImage(generation)),
        );
      } catch (loadError) {
        setError(loadError.message || "Unable to load generations.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [qrToken]);

  useEffect(() => {
    return () => {
      Object.values(generationImageUrlsRef.current).forEach((url) => {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const resolveGenerationImage = async (generation) => {
    const fileUrl = generation?.previewUrl || generation?.outputUrl;

    if (!fileUrl || generationImageUrls[generation._id]) {
      return generationImageUrls[generation?._id] || "";
    }

    if (imageLoading[generation._id]) {
      return "";
    }

    setImageLoading((previous) => ({
      ...previous,
      [generation._id]: true,
    }));

    try {
      const blobUrl = await fetchGenerationBlobUrl(fileUrl);

      setGenerationImageUrls((previous) => ({
        ...previous,
        [generation._id]: blobUrl,
      }));

      return blobUrl;
    } catch (imageError) {
      console.error("Unable to load generated card:", imageError);
      return "";
    } finally {
      setImageLoading((previous) => ({
        ...previous,
        [generation._id]: false,
      }));
    }
  };

  const handleDownload = async (generation) => {
    const fileUrl = generation?.downloadUrl || generation?.previewUrl || generation?.outputUrl;
    if (!fileUrl) return;

    try {
      const extension = isVideoGeneration(generation) ? "mp4" : "png";
      const filename = `${generation.template || "generation"}-${generation._id || Date.now()}.${extension}`;
      await downloadDoctorGeneration(fileUrl, filename);
    } catch (downloadError) {
      console.error("Unable to download generated card:", downloadError);
      window.alert("Unable to download the card. Please try again.");
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f6f9fc] font-sans text-[#10233f]">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex min-h-[76px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/doctor?qrToken=" + encodeURIComponent(qrToken))
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#52627a] hover:bg-slate-200"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-orange-500" />
                <h1 className="truncate text-[21px] font-bold sm:text-[24px]">
                  Generations
                </h1>
              </div>
              <p className="truncate text-[11px] text-[#718198] sm:text-[12px]">
                {doctor?.doctorName
                  ? "Created for Dr. " + doctor.doctorName
                  : "Your personalized cards and videos"}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-bold text-orange-600 sm:px-4 sm:py-2 sm:text-[11px]">
            {generations.length}{" "}
            {generations.length === 1 ? "Generation" : "Generations"}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
            <p className="text-[13px] text-[#718198]">
              Loading your generations...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="p-5">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {error}
          </div>
        </div>
      ) : generations.length === 0 ? (
        <div className="flex min-h-[60vh] items-center justify-center px-5 text-center">
          <div className="max-w-[420px]">
            <FileImage className="mx-auto h-10 w-10 text-orange-500" />
            <h2 className="mt-4 text-[19px] font-bold">No generations yet</h2>
            <p className="mt-2 text-[13px] text-[#718198]">
              Your personalized cards and videos will appear here after you create them.
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/doctor/templates?qrToken=" + encodeURIComponent(qrToken),
                )
              }
              className="mt-5 rounded-full bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-white"
            >
              Create a personalized card or video
            </button>
          </div>
        </div>
      ) : (
        <section className="w-full overflow-hidden bg-white">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[68px] sm:w-[92px]" />
              <col />
              <col className="w-[86px] sm:w-[120px]" />
              <col className="hidden lg:table-column lg:w-[190px]" />
              <col className="hidden sm:table-column sm:w-[105px]" />
              <col className="w-[68px] sm:w-[92px]" />
              <col className="w-[42px] sm:w-[54px]" />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-2 py-3 text-left sm:px-4">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#718198]">
                    Preview
                  </span>
                </th>
                <th className="px-2 py-3 text-left sm:px-4">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#718198]">
                    Receiver
                  </span>
                </th>
                <th className="px-2 py-3 text-left sm:px-4">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#718198]">
                    Type
                  </span>
                </th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#718198]">
                    Created
                  </span>
                </th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#718198]">
                    Status
                  </span>
                </th>
                <th className="px-2 py-3 text-center sm:px-4">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#718198]">
                    Download
                  </span>
                </th>
                <th className="px-1 py-3 text-center">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {generations.map((generation) => {
                const video = isVideoGeneration(generation);
                const expanded = expandedGenerationId === generation._id;
                const receiver = getReceiverName(generation);

                const details = video
                  ? [
                      [
                        "Doctor Name",
                        generation.metadata?.name ||
                          generation.metadata?.doctorName,
                      ],
                      [
                        "Speciality",
                        generation.metadata?.speciality ||
                          generation.metadata?.specialization,
                      ],
                      ["Hospital / Clinic", generation.metadata?.hospital],
                      ["City", generation.metadata?.city],
                    ].filter(([, value]) => value)
                  : [
                      ["Receiver", generation.metadata?.receiverName],
                      ["Sender", generation.metadata?.senderName],
                    ].filter(([, value]) => value);

                return [
                  <tr
                    key={generation._id}
                    className={
                      "border-b border-slate-100 " +
                      (expanded ? "bg-[#fffaf5]" : "bg-white")
                    }
                  >
                    <td className="px-2 py-2.5 sm:px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGeneration(generation);
                          resolveGenerationImage(generation);
                        }}
                        className="block h-[54px] w-[43px] overflow-hidden rounded-[8px] bg-slate-100 ring-1 ring-slate-200 sm:h-[62px] sm:w-[50px]"
                        aria-label="Open generation preview"
                      >
                        {isVideoGeneration(generation) ? (
                          <div className="relative h-full w-full bg-slate-950">
                            {generationImageUrls[generation._id] ? (
                              <video
                                src={generationImageUrls[generation._id]}
                                muted
                                autoPlay
                                loop
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Film className="h-5 w-5 text-slate-400" />
                              </div>
                            )}
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-orange-500">
                                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                              </span>
                            </span>
                          </div>
                        ) : generationImageUrls[generation._id] ? (
                          <img
                            src={generationImageUrls[generation._id]}
                            alt={receiver}
                            className="h-full w-full object-cover"
                          />
                        ) : fallbackTemplateImage(generation.template) ? (
                          <img
                            src={fallbackTemplateImage(generation.template)}
                            alt={titleFromTemplate(generation.template)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileImage className="h-5 w-5 text-slate-400" />
                          </div>
                        )}

                        {imageLoading[generation._id] && (
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[8px] font-semibold text-white">
                            Loading...
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="min-w-0 px-2 py-2.5 sm:px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGeneration(generation);
                          resolveGenerationImage(generation);
                        }}
                        className="block max-w-full text-left"
                      >
                        <p className="truncate text-[12px] font-bold text-[#10233f] sm:text-[13px]">
                          {receiver}
                        </p>
                        <p className="mt-0.5 truncate text-[9px] text-[#9aa8b8] sm:text-[10px]">
                          {titleFromTemplate(generation.template)}
                        </p>
                      </button>
                    </td>

                    <td className="px-2 py-2.5 sm:px-4">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-1 text-[9px] font-bold sm:text-[10px] " +
                          (video
                            ? "bg-purple-50 text-purple-600"
                            : "bg-blue-50 text-blue-600")
                        }
                      >
                        {video ? "Video" : "Card"}
                      </span>
                    </td>

                    <td className="hidden px-4 py-2.5 lg:table-cell">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#52627a]">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#9aa8b8]" />
                        <span className="truncate">
                          {formatDate(generation.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td className="hidden px-4 py-2.5 sm:table-cell">
                      <span
                        className={
                          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize " +
                          (generation.status === "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : generation.status === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600")
                        }
                      >
                        {generation.status}
                      </span>
                    </td>

                    <td className="px-2 py-2.5 text-center sm:px-4">
                      <button
                        type="button"
                        onClick={() => handleDownload(generation)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white sm:h-9 sm:w-9"
                        aria-label={"Download " + (video ? "video" : "card")}
                        title={"Download " + (video ? "video" : "card")}
                      >
                        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </td>

                    <td className="px-1 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGenerationId((current) =>
                            current === generation._id
                              ? null
                              : generation._id,
                          )
                        }
                        className={
                          "inline-flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 " +
                          (expanded
                            ? "bg-[#10233f] text-white"
                            : "bg-slate-100 text-[#52627a]")
                        }
                        aria-label={
                          expanded ? "Hide details" : "Show details"
                        }
                      >
                        <ChevronDown
                          className={
                            "h-3.5 w-3.5 transition-transform " +
                            (expanded ? "rotate-180" : "")
                          }
                        />
                      </button>
                    </td>
                  </tr>,

                  expanded ? (
                    <tr
                      key={generation._id + "-details"}
                      className="border-b border-slate-200 bg-[#fffaf5]"
                    >
                      <td colSpan={7} className="px-3 py-4 sm:px-5">
                        <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
                          {details.map(([label, value]) => (
                            <div key={label} className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                                {label}
                              </p>
                              <p className="mt-1 truncate text-[11px] font-semibold text-[#52627a]">
                                {value}
                              </p>
                            </div>
                          ))}

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                              Credits
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#52627a]">
                              <Coins className="h-3.5 w-3.5 text-[#9aa8b8]" />
                              {generation.creditsUsed ?? 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                              Created
                            </p>
                            <p className="mt-1 text-[11px] font-semibold text-[#52627a]">
                              {formatDate(generation.createdAt)}
                            </p>
                          </div>

                          <div className="col-span-2 flex items-end sm:col-span-2 lg:col-span-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedGeneration(generation);
                                resolveGenerationImage(generation);
                              }}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#10233f] px-3 py-2 text-[11px] font-semibold text-white"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Open Preview
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null,
                ];
              })}
            </tbody>
          </table>
        </section>
      )}

      {selectedGeneration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10233f]/70 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setSelectedGeneration(null)}
        >
          <div
            className="flex max-h-[94vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-[9px] font-bold " +
                      (isVideoGeneration(selectedGeneration)
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600")
                    }
                  >
                    {isVideoGeneration(selectedGeneration) ? "Video" : "Card"}
                  </span>
                  <span className="text-[10px] capitalize text-[#9aa8b8]">
                    {selectedGeneration.status}
                  </span>
                </div>

                <h2 className="mt-1.5 truncate text-[17px] font-bold text-[#10233f] sm:text-[19px]">
                  {getReceiverName(selectedGeneration)}
                </h2>

                <p className="mt-0.5 truncate text-[11px] text-[#718198]">
                  {titleFromTemplate(selectedGeneration.template)} ·{" "}
                  {formatDate(selectedGeneration.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGeneration(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 sm:h-9 sm:w-9"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-3 sm:p-5">
              {generationImageUrls[selectedGeneration._id] ? (
                isVideoGeneration(selectedGeneration) ? (
                  <video
                    src={generationImageUrls[selectedGeneration._id]}
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="mx-auto max-h-[58vh] w-auto max-w-full rounded-2xl bg-black shadow-md"
                  />
                ) : (
                  <img
                    src={generationImageUrls[selectedGeneration._id]}
                    alt={getReceiverName(selectedGeneration)}
                    className="mx-auto max-h-[58vh] w-auto max-w-full rounded-2xl shadow-md"
                  />
                )
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white text-[13px] text-slate-500">
                  {imageLoading[selectedGeneration._id]
                    ? "Loading generated file..."
                    : "Generated file is unavailable."}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                    Receiver
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold text-[#52627a]">
                    {getReceiverName(selectedGeneration)}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                    Type
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#52627a]">
                    {isVideoGeneration(selectedGeneration)
                      ? "Video"
                      : "Greeting Card"}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                    Credits
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#52627a]">
                    {selectedGeneration.creditsUsed ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                    Created
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#52627a]">
                    {formatDate(selectedGeneration.createdAt)}
                  </p>
                </div>

                {isVideoGeneration(selectedGeneration) &&
                  [
                    [
                      "Doctor Name",
                      selectedGeneration.metadata?.name ||
                        selectedGeneration.metadata?.doctorName,
                    ],
                    [
                      "Speciality",
                      selectedGeneration.metadata?.speciality ||
                        selectedGeneration.metadata?.specialization,
                    ],
                    ["Hospital / Clinic", selectedGeneration.metadata?.hospital],
                    ["City", selectedGeneration.metadata?.city],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[9px] font-bold uppercase tracking-wide text-[#9aa8b8]">
                          {label}
                        </p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-[#52627a]">
                          {value}
                        </p>
                      </div>
                    ))}
              </div>

              <button
                type="button"
                onClick={() => handleDownload(selectedGeneration)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-orange-400"
              >
                <Download className="h-4 w-4" />
                Download{" "}
                {isVideoGeneration(selectedGeneration) ? "Video" : "Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
