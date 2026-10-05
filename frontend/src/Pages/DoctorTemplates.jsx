import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Film,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getEpilepsyVideoPreviewUrl,
  getKidneyVideoPreviewUrl,
  getNashVideoPreviewUrl,
} from "../api/doctor.api";

const LocalTemplatePreview = ({ src, title, className = "" }) => {
  const isVideo = /\.(mp4|webm|ogg)$/i.test(src);

  if (isVideo) {
    return (
      <video
        src={src}
        title={title}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`h-full w-full object-fill ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={`h-full w-full object-fill ${className}`}
    />
  );
};

const TEMPLATES = [
  {
    id: "teachers-day",
    title: "Teachers Day",
    image: "/teachersday.png",
    preview: "/teachersday_demo.png",
    description: "A warm personalized card for teachers and mentors.",
  },
  {
    id: "independence-day",
    title: "Independence Day",
    image: "/independence.png",
    preview: "/independenceday_demo.png",
    description:
      "Celebrate the spirit of freedom with a personalized greeting.",
  },
  {
    id: "dussehra",
    title: "Dussehra",
    image: "/dussehra.png",
    preview: "/dussehra_demo.png",
    description: "Share festive wishes with a personalized Dussehra card.",
  },
  {
    id: "anniversary",
    title: "Anniversary",
    image: "/anniversary.png",
    preview: "/anniversary_demo.png",
    description: "Create a thoughtful anniversary greeting in a few steps.",
  },
  {
    id: "nash-doctor-intro",
    title: "Nash Video",
    type: "video",
    preview: "/nash_demo.mp4",
    description:
      "Create a personalized doctor introduction video with your photo and details.",
  },
  {
    id: "kidney-doctor-intro",
    title: "Kidney Day Doctor Video",
    type: "video",
    preview: "/Kidney_demo.mp4",
    description: "Create a personalized Kidney Day doctor introduction video.",
  },
  {
    id: "epilepsy-doctor-intro",
    title: "Epilepsy Doctor Video",
    type: "video",
    preview: "/Epilepsy_demo.mp4",
    description: "Create a personalized Epilepsy doctor introduction video.",
  },
];

export default function DoctorTemplates() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templateType, setTemplateType] = useState("image");

  const openTemplate = (templateId) => {
    navigate(
      `/doctor?qrToken=${encodeURIComponent(qrToken)}&template=${encodeURIComponent(templateId)}`,
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f9fc] px-4 py-5 font-sans text-[#10233f] sm:px-6 sm:py-8"><style>{`@keyframes templateSlideLeft{0%{opacity:0;transform:translate3d(20px,0,0) scale(.985)}60%{opacity:.92}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}}@keyframes templateSlideRight{0%{opacity:0;transform:translate3d(-20px,0,0) scale(.985)}60%{opacity:.92}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}}.template-swipe{will-change:transform,opacity;backface-visibility:hidden;transform-origin:center;}`}</style>
      <section className="mx-auto w-full max-w-[900px]">
        <button
          type="button"
          onClick={() =>
            navigate(`/doctor?qrToken=${encodeURIComponent(qrToken)}`)
          }
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
                Pick a design, add your recipient details and create a
                personalized card.
              </p>
            </div>
            {/* <div className="rounded-2xl border border-orange-100 bg-[#fff8f1] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#718198]">
                Generation cost
              </p>
              <p className="mt-0.5 text-[17px] font-bold text-orange-600">
                20 credits
              </p>
            </div> */}
          </div>

          <div className="mt-5 flex justify-end">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTemplateType("image")}
                className={`rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                  templateType === "image"
                    ? "bg-white text-[#10233f] shadow-sm"
                    : "text-[#718198]"
                }`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => setTemplateType("video")}
                className={`rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                  templateType === "video"
                    ? "bg-white text-[#10233f] shadow-sm"
                    : "text-[#718198]"
                }`}
              >
                Videos
              </button>
            </div>
          </div>

          <div className="relative mt-3 overflow-hidden"><div key={templateType} className={`template-swipe ${templateType === "video" ? "columns-2 gap-3 sm:columns-3 lg:columns-4 animate-[templateSlideLeft_480ms_cubic-bezier(0.16,1,0.3,1)]" : "columns-2 gap-3 sm:columns-3 lg:columns-4 animate-[templateSlideRight_480ms_cubic-bezier(0.16,1,0.3,1)]"}`}>
            {TEMPLATES.filter((template) =>
              templateType === "video"
                ? template.type === "video"
                : template.type !== "video",
            ).map((template, index) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setPreviewTemplate(template)}
                className="group mb-3 w-full break-inside-avoid overflow-hidden rounded-[16px] border border-slate-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="relative w-full overflow-hidden bg-slate-50"
                >
                  <LocalTemplatePreview
                    src={template.preview || template.image}
                    title={template.title}
                    className={`block w-full ${index % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]"} ${template.type === "video" ? "bg-slate-950" : ""}`}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
                    <h2 className="text-[12px] font-bold leading-[1.25] text-white">
                      {template.title}
                    </h2>
                  </div>
                </div>
              </button>
            ))}
            </div>
          </div>

          <p className="mt-1 text-center text-[11px] font-medium text-[#9aa8b8]">
            Swipe left or right to browse templates
          </p>          
        </div>
      </section>
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10233f]/65 p-4 backdrop-blur-sm"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="w-full max-w-[370px] overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-slate-100">
              <LocalTemplatePreview
                src={previewTemplate.preview || previewTemplate.image}
                title={previewTemplate.title}
                className={`block w-full ${previewTemplate.type === "video" ? "max-h-[430px] object-cover bg-slate-950" : "max-h-[430px] object-contain"}`}
              />
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#263b55] shadow-md"
                aria-label="Close template preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-[20px] font-bold tracking-[-0.5px] text-[#10233f]">
                {previewTemplate.title}
              </h3>
              <p className="mt-1 text-[13px] leading-[1.45] text-[#718198]">
                {previewTemplate.description}
              </p>
              <button
                type="button"
                onClick={() => {
                  const templateId = previewTemplate.id;
                  setPreviewTemplate(null);
                  openTemplate(templateId);
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-[14px] font-semibold text-white shadow-sm transition active:scale-[0.98]"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
