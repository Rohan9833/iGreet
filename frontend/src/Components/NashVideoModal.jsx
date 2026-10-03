import { useEffect, useRef, useState } from "react";
import { Film, ImagePlus, Send, X } from "lucide-react";
import {
  generateNashVideo,
  getDoctorVideoTemplate,
  getNashVideoPreviewUrl,
  API_BASE_URL,
} from "../api/doctor.api";
import NashVideoPreview from "./NashVideoPreview";
import NashImageCropper from "./NashImageCropper";

const GENERATION_COST = 20;

export default function NashVideoModal({
  qrToken,
  doctor,
  onGenerated,
  onGenerationStart,
  onGenerationComplete,
  onClose,
}) {
  const [form, setForm] = useState({
    name: doctor?.doctorName || "",
    qualification: "",
    specialization: doctor?.speciality || "",
    hospital: doctor?.clinicName || "",
  });
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [cropFile, setCropFile] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState("");

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await getDoctorVideoTemplate();
        setTemplate(data.templates?.[0] || null);
      } catch (loadError) {
        setError(loadError.message || "Unable to load the video template.");
      } finally {
        setLoadingTemplate(false);
      }
    };

    loadTemplate();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !creating) onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creating, onClose]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setCropFile(file);
    setError("");
    event.target.value = "";
  };

  const handleCropConfirm = (croppedFile) => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setCropFile(null);
    setError("");
  };

  const handleCropCancel = () => {
    setCropFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (creating) return;

    if ((doctor?.credits ?? 0) < GENERATION_COST) {
      setError("You do not have enough credits to create this video.");
      return;
    }

    if (!imageFile) {
      setError("Please upload a doctor photo.");
      return;
    }

    setCreating(true);
    setError("");
    onGenerationStart?.();

    try {
      const data = await generateNashVideo({
        qrToken,
        ...form,
        inputImage: imageFile,
      });

      onGenerated?.(data.credits);

      const generationId = data.generation?.id;

      const outputUrl = generationId
        ? `${API_BASE_URL}/api/doctors/generations/file/${encodeURIComponent(generationId)}?t=${Date.now()}`
        : data.generation?.outputUrl
          ? data.generation.outputUrl.startsWith("http")
            ? data.generation.outputUrl
            : `${API_BASE_URL}${data.generation.outputUrl}`
          : "";

      setGeneratedVideo(outputUrl);
      onGenerationComplete?.(data);
    } catch (generationError) {
      console.error("Unable to create Nash video:", generationError);
      onGenerationComplete?.(null, generationError);

      if (generationError.status === 402) {
        onGenerated?.(generationError.credits ?? 0);
      }

      setError(
        generationError.message ||
          "Unable to create the doctor introduction video.",
      );
    } finally {
      setCreating(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] text-[#10233f] outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100";

  if (creating) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#10233f]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !creating && onClose()}
    >
      <div
        className="max-h-[94vh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff3e8] px-3 py-1.5 text-[11px] font-bold text-orange-600">
              <Film className="h-3.5 w-3.5" />
              Video Template
            </div>
            <h3 className="text-[20px] font-bold tracking-[-0.5px] text-[#10233f]">
              {template?.name || "Nash Doctor Introduction"}
            </h3>
            <p className="mt-1 text-[13px] text-[#718198]">
              Create a personalized doctor introduction video.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf3f8] text-[#263b55] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {generatedVideo ? (
          <div className="mt-5">
            <NashVideoPreview
              src={generatedVideo}
              controls
              autoPlay
              muted={false}
              loop={false}
              className="mt-5 aspect-[1081/576] w-full rounded-2xl bg-slate-950"
            />

            <p className="mt-4 text-center text-[16px] font-bold text-[#10233f]">
              Doctor introduction video created!
            </p>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-orange-500 px-7 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5">
            <NashVideoPreview
              src={getNashVideoPreviewUrl()}
              autoPlay
              muted
              loop
              playsInline
              className="mb-5 aspect-[1081/576] w-full rounded-2xl bg-slate-950"
            />

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Doctor Name
                </label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Rohan Pal"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Qualification
                </label>
                <input
                  required
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Specialization
                </label>
                <input
                  required
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiologist"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Hospital / Clinic
                </label>
                <input
                  required
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  placeholder="e.g. ABC Hospital"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-[#52627a]">
                  Doctor Photo
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-xl border border-orange-100 bg-[#fffaf5]">
                    <div className="flex items-center gap-3 p-2.5">
                      <img
                        src={imagePreview}
                        alt="Selected doctor"
                        className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-[#10233f]">
                          {imageFile?.name || "Doctor photo"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-emerald-600">
                          Photo ready for video generation
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={creating}
                          className="mt-2 rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={creating}
                    className="flex w-full items-center gap-3 rounded-xl border border-dashed border-orange-200 bg-[#fffaf5] p-3 text-left transition hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                      <ImagePlus className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-[#10233f]">
                        Upload Doctor Image
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#718198]">
                        PNG, JPG or WebP • Tap to choose
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-[12px] font-medium leading-[1.4] text-red-600">
                {error}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-3.5 py-2.5">
              <span className="text-[12px] font-medium text-[#718198]">
                Generation cost
              </span>
              <span className="text-[13px] font-bold text-orange-600">
                {template?.creditCost ?? GENERATION_COST} credits
              </span>
            </div>

            <button
              type="submit"
              disabled={creating || (doctor?.credits ?? 0) < GENERATION_COST}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
              {creating
                ? "Creating Video..."
                : (doctor?.credits ?? 0) >= GENERATION_COST
                  ? `Create Video • ${template?.creditCost ?? GENERATION_COST} Credits`
                  : "No Credits Left"}
            </button>
          </form>
        )}
      </div>
      {cropFile && (
        <NashImageCropper
          file={cropFile}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
