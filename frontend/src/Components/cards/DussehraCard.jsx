import React from "react";

const BASE_WIDTH = 900;

const DussehraCard = ({
  width = BASE_WIDTH,
  receiverName = "",
  imageUrl = "",
}) => {
  const k = width / BASE_WIDTH;

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
        src="/dussehra.png"
        alt="dussehra greeting card template"
        style={{ display: "block", width: "100%", height: "auto" }}
        draggable={false}
      />

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Uploaded recipient"
          style={{
            position: "absolute",
            left: "25%",
            top: "2%",
            width: "51%",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      )}

      {receiverName && (
        <div
          style={{
            position: "absolute",
            left: "24%",
            right: "24%",
            top: "46%",
            textAlign: "center",
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1,
            color: "rgb(255 255 255)",
            fontSize: `${45 * k}px`,
          }}
        >
          {receiverName}
        </div>
      )}
    </div>
  );
};

export default DussehraCard;