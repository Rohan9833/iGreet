import React from "react";

/**
 * Teachers Day Card
 * Renders at any width. All internal values scale proportionally
 * to BASE_WIDTH so the preview and the downloaded image match exactly.
 */
const BASE_WIDTH = 900;

const TeachersDayCard = ({
  width = BASE_WIDTH,
  receiverName = "",
  senderName = "",
  imageUrl = "",
}) => {
  const k = width / BASE_WIDTH; // scale factor

  return (
    <div
      style={{
        position: "relative",
        width: width,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <img
        src="/teachersday.png"
        alt="Teachers Day greeting card template"
        style={{ display: "block", width: "100%", height: "auto" }}
        draggable={false}
      />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded recipient"
          style={{
            position: "absolute",
            left: `${27.25}%`,
            top: `${27.4}%`,
            width: `${45.5}%`,
            height: `${32}%`,
            borderRadius: "9999px",
            border: `${Math.max(1, 2 * k)}px solid white`,
            objectFit: "cover",
          }}
        />
      )}

      {receiverName && (
        <div
          style={{
            position: "absolute",
            left: "10%",
            right: "10%",
            top: "65.5%",
            textAlign: "center",
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1,
            color: "#f39a18",
            fontSize: `${63 * k}px`, // 7% of 900
          }}
        >
          {receiverName}
        </div>
      )}

      {senderName && (
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "91.5%",
            textAlign: "center",
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1,
            color: "#f39a18",
            fontSize: `${45 * k}px`, // 5% of 900
          }}
        >
          {senderName}
        </div>
      )}
    </div>
  );
};

export default TeachersDayCard;