import React from "react";
import { toBlob } from "html-to-image";
import TemplatePreview from "./TemplatePreview";

const EXPORT_WIDTH = 900; // fixed export width for high-res output

const renderGreetingCardBlob = async (template, form) => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${EXPORT_WIDTH}px`;
  container.style.background = "#ffffff";
  container.style.zIndex = "-1";
  document.body.appendChild(container);

  const { createRoot } = await import("react-dom/client");
  const root = createRoot(container);

  try {
    await new Promise((resolve) => {
      root.render(
        <TemplatePreview
          template={template}
          width={EXPORT_WIDTH}
          receiverName={form.receiverName}
          senderName={form.senderName}
          imageUrl={form.imageUrl}
        />,
      );
      setTimeout(resolve, 250);
    });

    // Wait for images
    const imgs = container.querySelectorAll("img");
    await Promise.all(
      Array.from(imgs).map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
      ),
    );

    // Extra settle tick
    await new Promise((resolve) => setTimeout(resolve, 150));

    const blob = await toBlob(container.firstChild, {
      quality: 1.0,
      pixelRatio: 1, // already high-res at 900px
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    if (!blob) {
      throw new Error("Unable to render the card.");
    }

    return { blob };
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
};

export default renderGreetingCardBlob;