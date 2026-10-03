import { useEffect, useMemo, useState } from "react";
import { Loader2, Play } from "lucide-react";

export default function NashVideoPreview({
  src,
  className = "",
  controls = false,
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
}) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const videoSrc = useMemo(() => {
    if (!src) return "";

    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}ngrok-skip-browser-warning=true`;
  }, [src]);

  useEffect(() => {
    setLoading(Boolean(videoSrc));
    setFailed(false);
  }, [videoSrc]);

  if (!videoSrc || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-950 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-white/70">
          <Play className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Video unavailable</span>
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

      <video
        key={videoSrc}
        src={videoSrc}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload="auto"
        className="block h-full w-full object-cover"
        onLoadedData={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
      />
    </div>
  );
}
