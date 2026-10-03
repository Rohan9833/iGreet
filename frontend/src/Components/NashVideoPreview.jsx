import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(Boolean(src));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(Boolean(src));
    setFailed(false);
  }, [src]);

  if (!src || failed) {
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
        key={src}
        src={src}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload="auto"
        className="block h-full w-full object-cover"
        onLoadedData={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onError={(event) => {
          console.error("Video failed:", src, event.currentTarget.error);
          setLoading(false);
          setFailed(true);
        }}
      />
    </div>
  );
}
