import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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

    context.drawImage(image, left, top, layout.width, layout.height);
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

    const sourceCropSize =
      Math.min(image.naturalWidth, image.naturalHeight) / zoom;

    const sourceCenterX = image.naturalWidth / 2 - layout.x / layout.scale;

    const sourceCenterY = image.naturalHeight / 2 - layout.y / layout.scale;

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
            <h3 className="text-[18px] font-bold text-[#10233f]">Crop Photo</h3>
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

export default CropEditor;