import { ArrowLeft, ArrowRight, CheckCircle2, Film, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getEpilepsyVideoPreviewUrl,
  getKidneyVideoPreviewUrl,
  getNashVideoPreviewUrl,
} from "../api/doctor.api";
import NashVideoPreview from "../Components/NashVideoPreview";

const TEMPLATES = [
  {
    id: "teachers-day",
    title: "Teachers Day",
    image: "/teachersday.png",
    description: "A warm personalized card for teachers and mentors.",
  },
  {
    id: "independence-day",
    title: "Independence Day",
    image: "/independence.png",
    description: "Celebrate the spirit of freedom with a personalized greeting.",
  },
  {
    id: "dussehra",
    title: "Dussehra",
    image: "/dussehra.png",
    description: "Share festive wishes with a personalized Dussehra card.",
  },
  {
    id: "anniversary",
    title: "Anniversary",
    image: "/anniversary.png",
    description: "Create a thoughtful anniversary greeting in a few steps.",
  },
  {
    id: "nash-doctor-intro",
    title: "Doctor Introduction Video",
    type: "video",
    preview: getNashVideoPreviewUrl(),
    description: "Create a personalized doctor introduction video with your photo and details.",
  },
  {
    id: "kidney-doctor-intro",
    title: "Kidney Day Doctor Video",
    type: "video",
    preview: getKidneyVideoPreviewUrl(),
    previewType: "image",
    description: "Create a personalized Kidney Day doctor introduction video.",
  },
  {
    id: "epilepsy-doctor-intro",
    title: "Epilepsy Doctor Video",
    type: "video",
    preview: getEpilepsyVideoPreviewUrl(),
    previewType: "video",
    description: "Create a personalized Epilepsy doctor introduction video.",
  },
];

export default function DoctorTemplates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";

  const openTemplate = (templateId) => {
    navigate(
      `/doctor?qrToken=${encodeURIComponent(qrToken)}&template=${encodeURIComponent(templateId)}`,
    );
  };

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff3e8] px-3 py-1.5 text-[11px] font-bold text-orange-600">
                <Sparkles className="h-3.5 w-3.5" />
                Personalized Cards
              </div>
              <h1 className="text-[28px] font-bold tracking-[-1px] sm:text-[34px]">
                Choose a template
              </h1>
              <p className="mt-1 max-w-[560px] text-[14px] leading-[1.5] text-[#718198]">
                Pick a design, add your recipient details and create a personalized card.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-[#fff8f1] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#718198]">Generation cost</p>
              <p className="mt-0.5 text-[17px] font-bold text-orange-600">20 credits</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => openTemplate(template.id)}
                className="group overflow-hidden rounded-[20px] border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative overflow-hidden bg-slate-50">
                  {template.type === "video" ? (
                    <div className="relative flex aspect-[1448/2048] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950 transition duration-300 group-hover:scale-[1.02]">
                      {template.previewType === "image" ? (
                        <img
                          src={template.preview}
                          alt={template.title}
                          className="h-full w-full object-cover"
                        />
                      ) : template.previewType === "video" ? (
                        <video
                          src={template.preview}
                          preload="auto"
                          muted
                          playsInline
                          controls={false}
                          className="h-full w-full object-cover"
                          onLoadedData={(event) => {
                            try {
                              event.currentTarget.currentTime = 0;
                            } catch {
                              // First decoded frame is sufficient for the preview.
                            }
                          }}
                        />
                      ) : template.preview ? (
                        <NashVideoPreview
                          src={template.preview}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center px-5 text-center text-white">
                          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                            <Film className="h-7 w-7" />
                          </span>
                          <span className="mt-3 text-sm font-bold">
                            {template.id === "kidney-doctor-intro" ? "Kidney Day" : "Epilepsy"}
                          </span>
                          <span className="mt-1 text-[10px] text-white/60">
                            Doctor introduction video
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-orange-500 shadow-lg">
                          <Film className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={template.image}
                      alt={template.title}
                      className="aspect-[1448/2048] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  )}
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-orange-500 shadow-sm">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-[16px] font-bold">{template.title}</h2>
                  <p className="mt-1.5 min-h-[42px] text-[12px] leading-[1.45] text-[#718198]">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-orange-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Use this template
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
