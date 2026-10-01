import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDoctorByQRToken } from "../api/doctor.api";
import { UserRound, ArrowRight, X, Send, Sparkles } from "lucide-react";

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
    id: "teachers-day",
    title: "Teachers Day",
    image: "/teachersday.png",
  },
];

/* -------------------------------------------------------
   Teachers Day preview
------------------------------------------------------- */
const TeacherDayCard = ({ receiverName = "", senderName = "", imageUrl = "" }) => (
  <div className="relative aspect-[1448/2048] w-full overflow-hidden bg-white">
    <img
      src="/teachersday.png"
      alt="Teachers Day greeting card template"
      className="absolute inset-0 h-full w-full object-cover"
    />

    {imageUrl && (
      <img
        src={imageUrl}
        alt="Uploaded recipient"
        className="absolute left-[27.25%] top-[27.4%] h-[32%] w-[45.5%] rounded-full border border-white object-cover"
      />
    )}

    {receiverName && (
      <div className="absolute left-[8%] right-[8%] top-[63%] text-center text-[clamp(10px,3vw,30px)] font-extrabold uppercase leading-none text-[#f39a18]">
        {receiverName}
      </div>
    )}

    {senderName && (
      <div className="absolute left-[8%] right-[8%] top-[91.5%] text-center text-[clamp(7px,2vw,20px)] font-extrabold uppercase leading-none text-[#f39a18]">
        {senderName}
      </div>
    )}
  </div>
);

/* -------------------------------------------------------
   Image crop editor
------------------------------------------------------- */
const CROP_SIZE = 320;

const CropEditor = ({ imageSrc, onCancel, onApply }) => {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImage(img);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    };

    img.onerror = () => {
      setImage(null);
    };

    img.src = imageSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  const getLayout = () => {
    if (!image) {
      return null;
    }

    const baseScale = Math.max(
      CROP_SIZE / image.naturalWidth,
      CROP_SIZE / image.naturalHeight,
    );

    const scale = baseScale * zoom;
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;

    const maxX = Math.max(0, (width - CROP_SIZE) / 2);
    const maxY = Math.max(0, (height - CROP_SIZE) / 2);

    return {
      scale,
      width,
      height,
      maxX,
      maxY,
      x: Math.max(-maxX, Math.min(maxX, position.x)),
      y: Math.max(-maxY, Math.min(maxY, position.y)),
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const layout = getLayout();

    if (!canvas || !image || !layout) {
      return;
    }

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

    const left = (CROP_SIZE - layout.width) / 2 + layout.x;
    const top = (CROP_SIZE - layout.height) / 2 + layout.y;

    context.drawImage(
      image,
      left,
      top,
      layout.width,
      layout.height,
    );
  }, [image, position, zoom]);

  const updatePosition = (x, y) => {
    if (!image) {
      return;
    }

    const layout = getLayout();

    if (!layout) {
      return;
    }

    setPosition({
      x: Math.max(-layout.maxX, Math.min(layout.maxX, x)),
      y: Math.max(-layout.maxY, Math.min(layout.maxY, y)),
    });
  };

  const handlePointerDown = (event) => {
    if (!image) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      positionX: position.x,
      positionY: position.y,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) {
      return;
    }

    updatePosition(
      dragRef.current.positionX + (event.clientX - dragRef.current.startX),
      dragRef.current.positionY + (event.clientY - dragRef.current.startY),
    );
  };

  const stopDragging = () => {
    dragRef.current = null;
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    const layout = getLayout();

    if (!canvas || !image || !layout) {
      return;
    }

    // Export at the highest useful resolution for the selected crop.
    const sourceCropSize = Math.min(
      image.naturalWidth,
      image.naturalHeight,
    ) / zoom;

    const sourceCenterX =
      image.naturalWidth / 2 - layout.x / layout.scale;

    const sourceCenterY =
      image.naturalHeight / 2 - layout.y / layout.scale;

    const sx = Math.max(
      0,
      Math.min(
        image.naturalWidth - sourceCropSize,
        sourceCenterX - sourceCropSize / 2,
      ),
    );

    const sy = Math.max(
      0,
      Math.min(
        image.naturalHeight - sourceCropSize,
        sourceCenterY - sourceCropSize / 2,
      ),
    );

    const outputSize = Math.round(sourceCropSize);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    const context = outputCanvas.getContext("2d");

    context.drawImage(
      image,
      sx,
      sy,
      sourceCropSize,
      sourceCropSize,
      0,
      0,
      outputSize,
      outputSize,
    );

    onApply(outputCanvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#10233f]/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[430px] overflow-hidden rounded-[26px] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-[18px] font-bold text-[#10233f]">
              Crop Photo
            </h3>
            <p className="mt-0.5 text-[12px] text-slate-500">
              Drag the photo and adjust the zoom.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-[#111827] px-5 py-5">
          <div
            className="mx-auto h-[320px] w-[320px] max-w-full cursor-grab touch-none overflow-hidden rounded-full bg-slate-900 shadow-inner active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onPointerLeave={stopDragging}
          >
            <canvas
              ref={canvasRef}
              width={CROP_SIZE}
              height={CROP_SIZE}
              className="block h-full w-full"
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-slate-500">
              Zoom
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="flex-1 accent-orange-500"
            />
            <span className="w-10 text-right text-[12px] font-semibold text-slate-600">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-full border border-slate-200 py-3 text-[14px] font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!image}
              className="flex-1 rounded-full bg-orange-500 py-3 text-[14px] font-semibold text-white shadow-sm disabled:opacity-50"
            >
              Use This Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Popup form
------------------------------------------------------- */
const TemplateModal = ({ template, onClose }) => {
  const [form, setForm] = useState({
    receiverName: "",
    senderName: "",
    imageUrl: "",
  });
  const [cropSource, setCropSource] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (form.imageUrl) {
        URL.revokeObjectURL(form.imageUrl);
      }
    };
  }, [form.imageUrl]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setCropSource(nextUrl);
    e.target.value = "";
  };

  const handleCropApply = (croppedImage) => {
    setForm((previous) => ({
      ...previous,
      imageUrl: croppedImage,
    }));

    setCropSource("");
  };

  const handleCropCancel = () => {
    if (cropSource) {
      URL.revokeObjectURL(cropSource);
    }

    setCropSource("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Teachers Day card data:", {
      template: template.id,
      receiverName: form.receiverName,
      senderName: form.senderName,
      image: form.imageUrl,
    });

    setSent(true);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-[#10233f] outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-[#10233f]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-[460px] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[20px] font-bold tracking-[-0.5px] text-[#10233f]">
              {template.title}
            </h3>
            <p className="text-[13px] text-[#718198]">
              Add the recipient, sender and photo.
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
          <div className="py-6">
            <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-slate-100 shadow-sm">
              <TeacherDayCard
                receiverName={form.receiverName}
                senderName={form.senderName}
                imageUrl={form.imageUrl}
              />
            </div>

            <p className="mt-4 text-center text-[16px] font-bold text-[#10233f]">
              Teachers Day card created!
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full bg-orange-500 px-6 py-2.5 text-[14px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mx-auto mb-5 w-[180px] overflow-hidden rounded-xl border border-orange-100 shadow-sm">
              <TeacherDayCard
                receiverName={form.receiverName}
                senderName={form.senderName}
                imageUrl={form.imageUrl}
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Receiver Name
                </label>
                <input
                  required
                  name="receiverName"
                  value={form.receiverName}
                  onChange={handleChange}
                  placeholder="e.g. HARSH"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Sender Name
                </label>
                <input
                  required
                  name="senderName"
                  value={form.senderName}
                  onChange={handleChange}
                  placeholder="e.g. ROHAN CHANDRAJEET PAL"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Recipient Image
                </label>
                <input
                  required={!form.imageUrl}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-orange-600"
                />
                {form.imageUrl && (
                  <p className="mt-1.5 text-[11px] font-medium text-emerald-600">
                    Photo cropped. Choose another image to crop it again.
                  </p>
                )}
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

      {cropSource && (
        <CropEditor
          imageSrc={cropSource}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}
    </>
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
              Templates
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
          <div className="mt-4 grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTemplate(t)}
                aria-label={t.title}
                className="group overflow-hidden rounded-[14px] border border-orange-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.title}
                    className="block aspect-[1448/2048] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-3 pb-3 pt-10">
                    <span className="text-[13px] font-bold text-white">
                      {t.title}
                    </span>
                  </div>
                </div>
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