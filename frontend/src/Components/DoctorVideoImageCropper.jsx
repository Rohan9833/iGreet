import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Move, RotateCcw, X } from "lucide-react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const CONFIG = {
  kidney: {
    ratio: 500 / 496,
    outputWidth: 500,
    outputHeight: 496,
    description:
      "Crop to the square-shaped image area used by the Kidney Day template.",
  },
  epilepsy: {
    ratio: 1080 / 1100,
    outputWidth: 1080,
    outputHeight: 1100,
    description:
      "Crop to the image area used by the Epilepsy video so the photo fills the frame without unwanted stretching.",
  },
};

export default function DoctorVideoImageCropper({
  file,
  templateId,
  onCancel,
  onConfirm,
}) {
  const config = CONFIG[templateId] || CONFIG.epilepsy;
  const [src, setSrc] = useState("");
  const [imageSize, setImageSize] = useState(null);
  const [cropWidth, setCropWidth] = useState(340);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const dragRef = useRef(null);

  const cropHeight = useMemo(
    () => cropWidth / config.ratio,
    [cropWidth, config.ratio],
  );

  useEffect(() => {
    if (!file) return undefined;

    const url = URL.createObjectURL(file);
    setSrc(url);
    setImageSize(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const updateCropSize = () => {
      const availableWidth = Math.max(
        260,
        Math.min(window.innerWidth - 32, 360),
      );
      setCropWidth(availableWidth);
    };

    updateCropSize();
    window.addEventListener("resize", updateCropSize);
    return () => window.removeEventListener("resize", updateCropSize);
  }, []);

  const baseScale = useMemo(() => {
    if (!imageSize) return 1;

    return Math.max(
      cropWidth / imageSize.width,
      cropHeight / imageSize.height,
    );
  }, [imageSize, cropWidth, cropHeight]);

  const displayedSize = useMemo(() => {
    if (!imageSize) return { width: 0, height: 0 };

    const scale = baseScale * zoom;

    return {
      width: imageSize.width * scale,
      height: imageSize.height * scale,
    };
  }, [imageSize, baseScale, zoom]);

  const clampPosition = (next, nextZoom = zoom) => {
    if (!imageSize) return next;

    const scale = baseScale * nextZoom;
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;

    const minX = Math.min(0, cropWidth - width);
    const minY = Math.min(0, cropHeight - height);

    return {
      x: clamp(next.x, minX, 0),
      y: clamp(next.y, minY, 0),
    };
  };

  const centerImage = () => {
    if (!imageSize) return;

    const scale = baseScale * zoom;
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;

    setPosition({
      x: (cropWidth - width) / 2,
      y: (cropHeight - height) / 2,
    });
  };

  useEffect(() => {
    if (!imageSize) return;
    centerImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSize?.width, imageSize?.height, cropWidth]);

  const handleImageLoad = (event) => {
    setImageSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    });
  };

  const handlePointerDown = (event) => {
    if (!imageSize || saving) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.id !== event.pointerId) return;

    event.preventDefault();

    setPosition(
      clampPosition({
        x: drag.startPosition.x + event.clientX - drag.startX,
        y: drag.startPosition.y + event.clientY - drag.startY,
      }),
    );
  };

  const stopDragging = (event) => {
    if (!dragRef.current) return;

    if (
      event?.pointerId == null ||
      event.pointerId === dragRef.current.id
    ) {
      dragRef.current = null;
    }
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);

    if (!imageSize) {
      setZoom(nextZoom);
      return;
    }

    const oldScale = baseScale * zoom;
    const newScale = baseScale * nextZoom;
    const centerX = cropWidth / 2;
    const centerY = cropHeight / 2;

    const imagePointX = (centerX - position.x) / oldScale;
    const imagePointY = (centerY - position.y) / oldScale;

    setZoom(nextZoom);
    setPosition(
      clampPosition(
        {
          x: centerX - imagePointX * newScale,
          y: centerY - imagePointY * newScale,
        },
        nextZoom,
      ),
    );
  };

  const resetCrop = () => {
    setZoom(1);
    window.requestAnimationFrame(() => {
      if (!imageSize) return;

      const width = imageSize.width * baseScale;
      const height = imageSize.height * baseScale;

      setPosition({
        x: (cropWidth - width) / 2,
        y: (cropHeight - height) / 2,
      });
    });
  };

  const handleConfirm = async () => {
    if (!imageSize || !src || saving) return;

    setSaving(true);

    try {
      const scale = baseScale * zoom;
      const sourceX = Math.max(0, -position.x / scale);
      const sourceY = Math.max(0, -position.y / scale);
      const sourceWidth = cropWidth / scale;
      const sourceHeight = cropHeight / scale;

      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = src;
      });

      const canvas = document.createElement("canvas");
      canvas.width = config.outputWidth;
      canvas.height = config.outputHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to prepare the cropped image.");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        config.outputWidth,
        config.outputHeight,
      );

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) {
        throw new Error("Unable to create the cropped image.");
      }

      onConfirm(
        new File([blob], `doctor-photo-${templateId}.jpg`, {
          type: "image/jpeg",
        }),
      );
    } catch (error) {
      console.error("Unable to crop doctor image:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#10233f]/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      style={{ height: "100dvh" }}
    >
      <div
        className="flex max-h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[26px] bg-white shadow-2xl sm:max-h-[94dvh] sm:rounded-[26px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0 pr-3">
            <h4 className="text-[17px] font-bold text-[#10233f]">
              Crop Doctor Photo
            </h4>
            <p className="mt-0.5 text-[11px] leading-4 text-[#718198]">
              Drag and zoom until the doctor fits inside the video image area.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf3f8] text-[#263b55] disabled:opacity-50"
            aria-label="Close cropper"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-4 sm:px-5">
          <div
            className="mx-auto"
            style={{ width: cropWidth, maxWidth: "100%" }}
          >
            <div
              className="relative overflow-hidden rounded-2xl bg-slate-950 select-none"
              style={{
                width: cropWidth,
                height: cropHeight,
                maxWidth: "100%",
                touchAction: "none",
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            >
              {src && (
                <img
                  src={src}
                  alt="Doctor crop preview"
                  onLoad={handleImageLoad}
                  draggable={false}
                  className="pointer-events-none absolute max-w-none"
                  style={{
                    width: displayedSize.width || "auto",
                    height: displayedSize.height || "auto",
                    left: position.x,
                    top: position.y,
                    userSelect: "none",
                  }}
                />
              )}

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-white/90" />

              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur">
                <span className="flex items-center gap-1.5">
                  <Move className="h-3 w-3" />
                  Drag image
                </span>
              </div>

              {!imageSize && (
                <div className="absolute inset-0 flex items-center justify-center text-[12px] text-white/80">
                  Loading image...
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-[360px] rounded-xl border border-orange-100 bg-orange-50 px-3.5 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-[#52627a]">
                Target image
              </span>
              <span className="text-right text-[11px] font-bold text-orange-600">
                {config.outputWidth} × {config.outputHeight}px
              </span>
            </div>

            <div className="mt-1 text-[10px] leading-4 text-[#718198]">
              {config.description}
            </div>

            <div className="mt-3 flex items-center gap-2.5">
              <span className="shrink-0 text-[10px] text-[#718198]">
                Zoom
              </span>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={handleZoomChange}
                disabled={!imageSize || saving}
                className="min-w-0 flex-1 accent-orange-500"
              />

              <button
                type="button"
                onClick={resetCrop}
                disabled={!imageSize || saving}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm disabled:opacity-50"
                aria-label="Reset crop"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 gap-2 border-t border-slate-100 bg-white px-4 pt-3 sm:px-5"
          style={{
            paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-full border border-slate-200 bg-white py-3 text-[13px] font-semibold text-[#52627a] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving || !imageSize}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-[13px] font-semibold text-white disabled:bg-slate-300"
          >
            <Check className="h-4 w-4" />
            {saving ? "Preparing..." : "Use This Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
