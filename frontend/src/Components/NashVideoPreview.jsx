import { useEffect, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { buildMediaUrl } from "../api/doctor.api";

export default function NashVideoPreview({
  src,
  className = "",
  controls = false,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
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

    const loadVideo = async () => {
      try {
        const response = await fetch(buildMediaUrl(src), {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Video request failed with HTTP ${response.status}`);
        }

        const blob = await response.blob();

        if (!blob.size) {
          throw new Error("Video response was empty.");
        }

        objectUrl = URL.createObjectURL(blob);

        if (!cancelled) {
          setMediaUrl(objectUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error("Video preview fetch failed:", src, error);

        if (!cancelled) {
          setLoading(false);
          setFailed(true);
        }
      }
    };

    loadVideo();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-950 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-white/70">
          <Play className="h-5 w-5" />
          <span className="text-[10px] font-semibold">
            Video unavailable
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
          <Loader2 className="h-5 w-5 animate-spin text-white/70" />
        </div>
      )}

      {mediaUrl && (
        <video
          key={mediaUrl}
          src={mediaUrl}
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          preload="auto"
          className="block h-full w-full object-cover"
          onLoadedData={() => setLoading(false)}
          onCanPlay={(event) => {
            setLoading(false);
            if (autoPlay) {
              event.currentTarget.play().catch(() => {});
            }
          }}
          onError={(event) => {
            console.error(
              "Video playback failed:",
              src,
              event.currentTarget.error,
            );
            setLoading(false);
            setFailed(true);
          }}
        />
      )}
    </div>
  );
}
