import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDoctorByQRToken } from "../api/doctor.api";
import { UserRound, ArrowRight, Heart, X, Send, Sparkles } from "lucide-react";

/* -------------------------------------------------------
   Logo
------------------------------------------------------- */
const MediQRLogo = () => (
  <div className="flex items-center gap-2">
    <div className="relative h-8 w-8">
      <span className="absolute left-0 top-[10px] h-[13px] w-[13px] rounded-[4px] bg-orange-400" />
      <span className="absolute left-[10px] top-0 h-[13px] w-[13px] rounded-[4px] bg-orange-400" />
      <span className="absolute left-[20px] top-[10px] h-[13px] w-[13px] rounded-[4px] bg-orange-500" />
      <span className="absolute left-[10px] top-[20px] h-[13px] w-[13px] rounded-[4px] bg-orange-500" />
    </div>
    <div className="text-[22px] font-bold tracking-[-0.8px] text-[#10233f]">
      Medi<span className="text-orange-500">QR</span>
    </div>
  </div>
);

/* -------------------------------------------------------
   Doctor Illustration (SVG)
------------------------------------------------------- */
const DoctorIllustration = () => (
  <div className="relative h-[175px] w-[160px] overflow-hidden">
    <div className="absolute right-[-8px] top-[10px] h-[150px] w-[150px] rounded-full bg-[#fff0e5]" />
    <div className="absolute right-[5px] top-[45px] h-[90px] w-[90px] rounded-full bg-[#ffe6d2] opacity-70" />

    <img
      src="/asd123.png"
      alt="Smiling doctor wearing a white coat and stethoscope"
      className="absolute bottom-[-12px] right-[-8px] h-[168px] w-[150px] object-contain object-bottom"
      loading="eager"
    />
  </div>
);

/* -------------------------------------------------------
   Small illustrations for action cards
------------------------------------------------------- */
const GreetingCardIllustration = () => (
  <svg viewBox="0 0 120 110" className="h-[105px] w-[115px] shrink-0" fill="none">
    <circle cx="48" cy="52" r="42" fill="#ffd4aa" />
    <g transform="rotate(-8 50 55)">
      <rect x="26" y="22" width="62" height="70" rx="7" fill="#f6b274" />
    </g>
    <g transform="rotate(5 60 58)">
      <rect x="34" y="20" width="64" height="74" rx="7" fill="#fffaf4" stroke="#fde3c8" />
      <path
        d="M66 72 C50 60 54 46 66 53 C78 46 82 60 66 72 Z"
        fill="#ef5f5a"
      />
      <path d="M52 40 L49 34 M66 38 L66 31 M80 40 L83 34" stroke="#f08a3c" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

const TemplatesStackIllustration = () => (
  <svg viewBox="0 0 120 110" className="h-[105px] w-[115px] shrink-0" fill="none">
    <circle cx="52" cy="58" r="44" fill="#dfe8fb" opacity="0.7" />
    <g transform="rotate(-14 50 60)">
      <rect x="18" y="26" width="58" height="68" rx="8" fill="#477ed0" />
    </g>
    <g transform="rotate(-5 55 58)">
      <rect x="28" y="22" width="60" height="70" rx="8" fill="#759ee1" />
    </g>
    <g transform="rotate(4 65 55)">
      <rect x="40" y="16" width="62" height="72" rx="8" fill="#fff" stroke="#dbe6fb" />
      <circle cx="58" cy="36" r="6" fill="#fbbf24" />
      <path d="M46 78 L66 50 L80 68 L88 58 L98 78 Z" fill="#34d399" />
      <path d="M66 50 L80 68 L66 78 L46 78 Z" fill="#10b981" />
    </g>
  </svg>
);

/* -------------------------------------------------------
   Decorations for template cards
------------------------------------------------------- */
const Flower = ({ className = "" }) => (
  <svg viewBox="0 0 40 40" className={className}>
    {[0, 72, 144, 216, 288].map((r) => (
      <ellipse
        key={r}
        cx="20"
        cy="10"
        rx="6"
        ry="9"
        fill="#f7b9a6"
        transform={`rotate(${r} 20 20)`}
      />
    ))}
    <circle cx="20" cy="20" r="4" fill="#f4c26b" />
  </svg>
);

const Leaves = ({ className = "" }) => (
  <svg viewBox="0 0 60 60" className={className}>
    <path d="M5 55 Q30 40 55 8" stroke="#7a9a78" strokeWidth="1.5" fill="none" />
    {[
      [18, 44, -35],
      [28, 36, 40],
      [36, 26, -35],
      [46, 16, 40],
    ].map(([x, y, r], i) => (
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx="9"
        ry="4"
        fill="#9db89a"
        transform={`rotate(${r} ${x} ${y})`}
      />
    ))}
  </svg>
);

/* -------------------------------------------------------
   Templates data + preview
------------------------------------------------------- */
const TEMPLATES = [
  {
    id: "get-well",
    title: "Get Well Soon",
    defaultMessage:
      "Wishing you a speedy recovery. Take rest and take care of yourself!",
  },
  {
    id: "birthday",
    title: "Happy Birthday",
    defaultMessage:
      "Wishing you a very Happy Birthday! Stay healthy and happy always.",
  },
  {
    id: "thank-you",
    title: "Thank You",
    defaultMessage:
      "Thank you for trusting me with your care. It was a pleasure.",
  },
];

const TemplatePreview = ({ type }) => {
  if (type === "get-well") {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#fffaf4]">
        <Flower className="absolute -left-3 -top-3 h-14 w-14" />
        <Flower className="absolute left-5 top-1 h-8 w-8 opacity-80" />
        <Flower className="absolute -bottom-4 -right-3 h-16 w-16" />
        <Leaves className="absolute right-0 top-2 h-14 w-14" />
        <div className="text-center font-serif text-[22px] italic leading-[1.1] text-[#8a3b2a]">
          Get Well
          <br />
          Soon
        </div>
        <Heart className="mt-2 h-3.5 w-3.5 fill-[#ef8068] text-[#ef8068]" />
      </div>
    );
  }

  if (type === "birthday") {
    return (
      <div className="relative flex h-full w-full flex-col items-center overflow-hidden bg-[#fff8ed] pt-4">
        <div className="text-[9px] tracking-[5px] text-slate-500">HAPPY</div>
        <div className="font-serif text-[24px] italic text-[#29394c]">Birthday</div>
        <svg viewBox="0 0 100 100" className="mt-1 h-[95px] w-[90px]">
          <path d="M40 60 L48 82 M62 58 L52 82 M50 52 L50 82" stroke="#b9a58f" strokeWidth="1" />
          <ellipse cx="34" cy="48" rx="15" ry="18" fill="#7aa8c9" />
          <ellipse cx="62" cy="42" rx="15" ry="18" fill="#eab277" />
          <ellipse cx="48" cy="34" rx="15" ry="18" fill="#f2c37c" />
          <rect x="36" y="80" width="28" height="18" rx="2" fill="#4f7c94" />
          <rect x="47" y="80" width="6" height="18" fill="#f2c37c" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#fbfcf8]">
      <Leaves className="absolute right-0 top-0 h-16 w-16" />
      <Leaves className="absolute bottom-0 left-0 h-16 w-16 rotate-180" />
      <div className="font-serif text-[22px] italic text-[#304c47]">Thank You</div>
      <div className="mt-2 h-px w-14 bg-[#d7b49b]" />
      <Heart className="mt-2 h-3 w-3 fill-[#ef8068] text-[#ef8068]" />
    </div>
  );
};

/* -------------------------------------------------------
   Popup form
------------------------------------------------------- */
const TemplateModal = ({ template, onClose, doctorName }) => {
  const [form, setForm] = useState({
    patientName: "",
    doctorName: doctorName || "",
    phone: "",
    message: template.defaultMessage,
  });
  const [sent, setSent] = useState(false);

  // Esc se close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // 👉 yaha apna API call / card generate logic daal
    console.log("Card data:", { template: template.id, ...form });
    setSent(true);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-[#10233f] outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#10233f]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[20px] font-bold tracking-[-0.5px] text-[#10233f]">
              {template.title}
            </h3>
            <p className="text-[13px] text-[#718198]">
              Fill details to create the card
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf3f8] text-[#263b55]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="py-10 text-center">
            <div className="text-5xl">🎉</div>
            <p className="mt-3 text-[18px] font-bold text-[#10233f]">
              Card ready for {form.patientName || "patient"}!
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-orange-500 px-6 py-2.5 text-[14px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            {/* preview */}
            <div className="mx-auto mb-4 h-[150px] w-[115px] overflow-hidden rounded-xl border border-orange-100 shadow-sm">
              <TemplatePreview type={template.id} />
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Patient Name
                </label>
                <input
                  required
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="e.g. Amit Sharma"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Doctor Name
                </label>
                <input
                  required
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Patient Phone (WhatsApp)
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Message
                </label>
                <textarea
                  required
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-[15px] font-semibold text-white shadow-sm transition active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              Create Card
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Main Page
------------------------------------------------------- */
export default function Drcreate() {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("qrToken") || "";
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(null);

  useEffect(() => {
    if (!qrToken) {
      setDoctorError("No QR code was provided.");
      setLoadingDoctor(false);
      return;
    }

    const loadDoctor = async () => {
      try {
        const data = await getDoctorByQRToken(qrToken);
        if (data.qr.status !== "assigned" || !data.doctor) {
          throw new Error("This QR code is not assigned to a doctor.");
        }
        setDoctor(data.doctor);
      } catch (error) {
        console.error(error);
        setDoctorError(error.message || "Unable to load doctor details.");
      } finally {
        setLoadingDoctor(false);
      }
    };

    loadDoctor();
  }, [qrToken]);

  if (loadingDoctor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9fc] text-[#10233f]">
        Loading doctor profile...
      </main>
    );
  }

  if (doctorError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9fc] px-5 text-center text-[#10233f]">
        {doctorError}
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f9fc] font-sans">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-[110px] top-[60px] h-[280px] w-[280px] rounded-full bg-[#fff0e7]" />
      <div className="pointer-events-none absolute -left-[100px] top-[210px] h-[70px] w-[260px] -rotate-[14deg] rounded-[50%] border-t-[7px] border-orange-400" />
      <div className="pointer-events-none absolute -right-[120px] bottom-[100px] h-[260px] w-[260px] rounded-full bg-[#fff0e7]" />
      <div className="pointer-events-none absolute -right-[100px] top-[560px] h-[70px] w-[240px] rotate-[45deg] rounded-[50%] border-t-[7px] border-orange-300" />

      {/* Mobile container */}
      <section className="relative z-10 mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-white px-5 pb-7 pt-5 shadow-[0_15px_50px_rgba(25,45,70,0.08)] sm:my-6 sm:min-h-0 sm:rounded-[28px]">
        {/* Header */}
        <header className="flex items-center justify-between">
          <MediQRLogo />

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-full border border-orange-100 bg-[#fff5ec] px-3 text-[12px] font-semibold text-[#e96526] shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{doctor?.credits ?? 0} Credits</span>
            </button>

            {/* <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3f8] text-[#263b55]"
            >
              <UserRound className="h-5 w-5" />
            </button> */}
          </div>
        </header>

        {/* Welcome */}
        <section className="relative mt-6 h-[175px]">
          <div className="relative z-10 pt-6">
            <p className="text-[18px] font-medium text-[#718198]">Welcome,</p>
            <div className="mt-1 flex items-center gap-1.5">
              <h1 className="whitespace-nowrap text-[26px] font-bold tracking-[-1px] text-[#10233f]">
                {doctor?.doctorName || "Doctor"}
              </h1>
              <span className="text-[24px]">👋</span>
            </div>
            <p className="mt-2 max-w-[220px] text-[14px] leading-[1.45] text-[#718198]">
              Create and share personalized greeting cards for your patients.
            </p>
          </div>

          <div className="absolute -right-4 bottom-0 z-0">
            <DoctorIllustration />
          </div>
        </section>

        {/* Create Greeting Card */}
        <button
          type="button"
          className="group relative mt-4 flex min-h-[145px] w-full items-center gap-2 overflow-hidden rounded-[18px] border border-orange-100 bg-[#fff4e9] px-4 text-left transition active:scale-[0.99]"
        >
          <GreetingCardIllustration />
          <div className="flex-1">
            <h2 className="text-[22px] font-bold leading-[1.1] tracking-[-0.6px] text-[#10233f]">
              Create
              <br />
              Greeting Card
            </h2>
            <p className="mt-2 text-[12.5px] leading-[1.4] text-[#718198]">
              Design personalized greeting cards for your patients.
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition group-active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>

        {/* Browse Templates */}
        <button
          type="button"
          className="group relative mt-3 flex min-h-[135px] w-full items-center gap-2 overflow-hidden rounded-[18px] border border-blue-100 bg-[#f1f6ff] px-4 text-left transition active:scale-[0.99]"
        >
          <TemplatesStackIllustration />
          <div className="flex-1">
            <h2 className="text-[22px] font-bold leading-[1.1] tracking-[-0.6px] text-[#10233f]">
              Browse
              <br />
              Templates
            </h2>
            <p className="mt-2 text-[12.5px] leading-[1.4] text-[#718198]">
              Choose from beautiful ready-to-use templates.
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3ecfb] text-[#17263a] transition group-active:scale-95">
            <ArrowRight className="h-5 w-5" />
          </div>
        </button>

        {/* Recent Creations */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold tracking-[-0.5px] text-[#10233f]">
              Recent Creations
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full bg-[#fff1e5] px-4 py-2 text-[13px] font-medium text-orange-500"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Clickable templates */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTemplate(t)}
                aria-label={t.title}
                className="aspect-[0.68] overflow-hidden rounded-[12px] border border-orange-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
              >
                <TemplatePreview type={t.id} />
              </button>
            ))}
          </div>
        </section>
      </section>

      {/* Popup */}
      {activeTemplate && (
        <TemplateModal
          key={activeTemplate.id}
          template={activeTemplate}
          doctorName={doctor?.doctorName}
          onClose={() => setActiveTemplate(null)}
        />
      )}
    </main>
  );
}