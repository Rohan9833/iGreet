import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { buildMediaUrl } from "../api/doctor.api";

export default function DoctorMediaImage({
  src,
  alt = "",
  className = "",
}) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    setMediaUrl("");
    setLoading(Boolean(src));
    setFailed(false);

    if (!src) return undefined;

    const loadImage = async () => {
      try {
        const response = await fetch(buildMediaUrl(src), {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Media request failed with HTTP ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob.size) {
          throw new Error("Media response was empty.");
        }

        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setMediaUrl(objectUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error("Image preview failed:", src, error);

        if (!cancelled) {
          setLoading(false);
          setFailed(true);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (failed || !mediaUrl) {
    return (
      <div className={`relative flex items-center justify-center bg-slate-950 ${className}`}>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white/70" />
        ) : (
          <span className="px-3 text-center text-[10px] font-semibold text-white/70">
            Preview unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={alt}
      className={className}
      onError={() => {
        setFailed(true);
        setLoading(false);
      }}
    />
  );
}
