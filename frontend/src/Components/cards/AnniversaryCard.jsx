import React from "react";

const BASE_WIDTH = 900;

const AnniversaryCard = ({
  width = BASE_WIDTH,
  receiverName = "",
  imageUrl = "",
}) => {
  const k = width / BASE_WIDTH;

  return (
    <div
      style={{
        position: "relative",
        width,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <img
        src="/anniversary.png"
        alt="Anniversary greeting card template"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
        draggable={false}
      />

      {imageUrl && (
        <div
          style={{
            position: "absolute",
            left: "22%",
            top: "10%",
            width: "59%",
            aspectRatio: "1 / 1",
            overflow: "hidden",
            borderRadius: "50%",
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
              objectPosition: "center center",
            }}
            draggable={false}
          />
        </div>
      )}

      {receiverName && (
        <div
          style={{
            position: "absolute",
            left: "24%",
            right: "24%",
            top: "90%",
            textAlign: "center",
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1,
            color: "#ef5f1f",
            fontSize: `${45 * k}px`,
          }}
        >
          {receiverName}
        </div>
      )}
    </div>
  );
};

export default AnniversaryCard;