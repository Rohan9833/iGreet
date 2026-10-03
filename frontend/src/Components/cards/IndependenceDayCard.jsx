import React, { useEffect, useRef, useState } from "react";

const BASE_WIDTH = 900;

// Blank template ke circle ke andar photo (900px base ke hisaab se)
const PHOTO = { left: 225, top: 44, size: 600 };

// Blue name pill
const PILL = { left: 213, top: 519, width: 475, height: 57 };

// Lamba naam aaye to font chhota ho (preview aur download dono me same)
const getFontSize = (text) => {
  const len = text.length;
  if (len <= 8) return 40;
  if (len <= 12) return 32;
  if (len <= 16) return 26;
  if (len <= 22) return 20;
  return 16;
};

/* ------------------------------------------------------------------ */
/*  PREVIEW COMPONENT                                                  */
/* ------------------------------------------------------------------ */
const IndependenceDayCard = ({
  width = BASE_WIDTH, // sirf MAX width
  receiverName = "",
  imageUrl = "",
}) => {
  const wrapRef = useRef(null);
  const [k, setK] = useState(width / BASE_WIDTH);
  const name = receiverName.trim();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setK(w / BASE_WIDTH);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: width,
        minWidth: 0,
        margin: "0 auto",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <img
        src="/independence.png"
        alt="Independence Day greeting card template"
        style={{ display: "block", width: "100%", height: "auto" }}
        draggable={false}
      />

      {imageUrl && (
        <div
          style={{
            position: "absolute",
            left: PHOTO.left * k,
            top: PHOTO.top * k,
            width: PHOTO.size * k,
            height: PHOTO.size * k,
            overflow: "hidden",
            borderRadius: "50%",
            background: "#ffffff",
          }}
        >
          <img
            src={imageUrl}
            alt="Uploaded recipient"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
            draggable={false}
          />
        </div>
      )}

      {name && (
        <div
          style={{
            position: "absolute",
            left: PILL.left * k,
            top: PILL.top * k,
            width: PILL.width * k,
            height: PILL.height * k,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
            padding: `0 ${16 * k}px`,
            color: "#ffffff",
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            fontSize: `${getFontSize(name) * k}px`,
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
};

export default IndependenceDayCard;

/* ------------------------------------------------------------------ */
/*  DOWNLOAD HELPERS (canvas based, DOM capture nahi)                  */
/* ------------------------------------------------------------------ */
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // remote image (Cloudinary/IPFS) ke liye CORS
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image load failed: ${src}`));
    img.src = src;
  });

// Card ko canvas pe draw karke Blob return karta hai
export const renderIndependenceCardBlob = async ({
  receiverName = "",
  imageUrl = "",
  templateSrc = "/independence.png",
}) => {
  const bg = await loadImage(templateSrc);
  const s = bg.naturalWidth / BASE_WIDTH; // template ki real size ke hisaab se scale

  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");

  // 1) Template
  ctx.drawImage(bg, 0, 0);

  // 2) Photo (circle crop, object-fit: cover + center top)
  if (imageUrl) {
    const photo = await loadImage(imageUrl);
    const d = PHOTO.size * s;
    const scale = Math.max(d / photo.width, d / photo.height);
    const sw = d / scale;
    const sh = d / scale;
    const sx = (photo.width - sw) / 2; // horizontal center
    const sy = 0; // top se, taaki face cut na ho

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      (PHOTO.left + PHOTO.size / 2) * s,
      (PHOTO.top + PHOTO.size / 2) * s,
      d / 2,
      0,
      Math.PI * 2
    );
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(PHOTO.left * s, PHOTO.top * s, d, d);
    ctx.drawImage(photo, sx, sy, sw, sh, PHOTO.left * s, PHOTO.top * s, d, d);
    ctx.restore();
  }

  // 3) Name (pill ke beech me)
  const name = receiverName.trim();
  if (name) {
    const text = name.toUpperCase();
    const fontFamily =
      getComputedStyle(document.body).fontFamily || "Arial, sans-serif";
    const fontSize = getFontSize(name) * s;

    ctx.font = `800 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      text,
      (PILL.left + PILL.width / 2) * s,
      (PILL.top + PILL.height / 2) * s + 2 * s,
      (PILL.width - 32) * s // max width, lamba naam pill se bahar nahi jaayega
    );
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png"
    )
  );
};

export const downloadIndependenceCard = async ({
  receiverName = "",
  imageUrl = "",
  templateSrc = "/independence.png",
}) => {
  const blob = await renderIndependenceCardBlob({
    receiverName,
    imageUrl,
    templateSrc,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `independence-day-${receiverName.trim() || "card"}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};