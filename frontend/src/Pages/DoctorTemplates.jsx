import { ArrowLeft, ArrowRight, CheckCircle2, Film, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);
  const [cardTransforms, setCardTransforms] = useState([]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let frameId = 0;

    const updateCardTransforms = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;

        const nextTransforms = cardRefs.current.map((card) => {
          if (!card) {
            return {
              rotateY: 0,
              translateZ: 0,
              scale: 1,
              opacity: 1,
              zIndex: 10,
            };
          }

          const cardWidth = card.offsetWidth;
          const cardCenter = carouselRect.left + card.offsetLeft - carousel.scrollLeft + cardWidth / 2;
          const distance = cardCenter - carouselCenter;
          const normalizedDistance =
            distance / Math.max(cardWidth * 1.05, 1);
          const curve = Math.max(-1.35, Math.min(1.35, normalizedDistance));
          const depth = Math.min(Math.abs(curve), 1);

          return {
            rotateY: curve * -16,
            translateZ: -depth * 32,
            scale: 1 - depth * 0.075,
            opacity: 1 - depth * 0.22,
            zIndex: Math.round(100 - depth * 50),
          };
        });

        setCardTransforms(nextTransforms);
      });
    };

    updateCardTransforms();
    carousel.addEventListener("scroll", updateCardTransforms, {
      passive: true,
    });
    window.addEventListener("resize", updateCardTransforms);

    return () => {
      cancelAnimationFrame(frameId);
      carousel.removeEventListener("scroll", updateCardTransforms);
      window.removeEventListener("resize", updateCardTransforms);
    };
  }, []);

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

          <div
            ref={carouselRef}
            className="relative mt-6 overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              perspective: "1100px",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              className="flex w-max items-stretch gap-4 py-4"
              style={{
                paddingLeft: "calc((100% - min(82vw, 320px)) / 2)",
                paddingRight: "calc((100% - min(82vw, 320px)) / 2)",
                transformStyle: "preserve-3d",
              }}
            >
              {TEMPLATES.map((template, index) => {
                const transform = cardTransforms[index] || {
                  rotateY: 0,
                  translateZ: 0,
                  scale: 1,
                  opacity: 1,
                  zIndex: 10,
                };

                return (
                  <button
                    key={template.id}
                    ref={(element) => {
                      cardRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => openTemplate(template.id)}
                    className="group w-[82vw] max-w-[320px] shrink-0 snap-center overflow-hidden rounded-[22px] border border-slate-100 bg-white text-left shadow-[0_14px_35px_rgba(25,45,70,0.10)] outline-none"
                    style={{
                      transform: `translate3d(0, 0, 0) translateZ(${transform.translateZ}px) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
                      opacity: transform.opacity,
                      zIndex: transform.zIndex,
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      willChange: "transform, opacity",
                    }}
                  >
                    <div className="relative overflow-hidden bg-slate-50">
                      {template.type === "video" ? (
                        <div className="relative flex aspect-[1448/2048] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-orange-950">
                          {template.id === "epilepsy-doctor-intro" ? (
                            <video
                              src={getEpilepsyVideoPreviewUrl()}
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="auto"
                              controls={false}
                              className="h-full w-full object-cover"
                              onCanPlay={(event) => {
                                event.currentTarget.play().catch(() => {});
                              }}
                            />
                          ) : template.id === "kidney-doctor-intro" ? (
                            <img
                              src={getKidneyVideoPreviewUrl()}
                              alt={template.title}
                              className="h-full w-full object-cover"
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
                                Doctor introduction video
                              </span>
                              <span className="mt-1 text-[10px] text-white/60">
                                Preview unavailable
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
                          className="aspect-[1448/2048] w-full object-cover"
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
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/70 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/70 to-transparent" />
          </div>

          <p className="mt-1 text-center text-[11px] font-medium text-[#9aa8b8]">
            Swipe left or right to browse templates
          </p>          </div>
        </div>
      </section>
    </main>
  );
}
