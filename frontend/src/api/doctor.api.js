const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

export const API_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
  "Cache-Control": "no-cache",
};

const getMrAuthHeaders = () => {
  const token = localStorage.getItem("igreet_mr_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const registerDoctor = async (doctorData) => {
  const response = await fetch(`${API_BASE_URL}/api/doctors/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...API_HEADERS,
      ...getMrAuthHeaders(),
    },
    body: JSON.stringify(doctorData),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to register the doctor.");
  }

  return data;
};

export const getDoctorByQRToken = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/api/doctors/by-qr/${encodeURIComponent(token)}?t=${Date.now()}`,
    {
      method: "GET",
      headers: API_HEADERS,
    },
  );

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to load doctor details.");
  }

  return data;
};

export const createDoctorGeneration = async ({
  qrToken,
  template,
  receiverName,
  senderName = "",
  cardBlob,
}) => {
  const formData = new FormData();
  formData.append("qrToken", qrToken);
  formData.append("template", template);
  formData.append("receiverName", receiverName);
  formData.append("senderName", senderName);

  if (cardBlob) {
    formData.append("card", cardBlob, `${template}-card.png`);
  }

  const response = await fetch(`${API_BASE_URL}/api/doctors/generate`, {
    method: "POST",
    headers: API_HEADERS,
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data?.success) {
    const error = new Error(data?.message || "Unable to create the generation.");
    error.status = response.status;
    error.credits = data?.credits;
    error.requiredCredits = data?.requiredCredits;
    throw error;
  }

  return data;
};

export const getDoctorGenerationsByQRToken = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/api/doctors/generations/by-qr/${encodeURIComponent(token)}?t=${Date.now()}`,
    {
      method: "GET",
      headers: API_HEADERS,
    },
  );

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to load generations.");
  }

  return {
    ...data,
    generations: (data.generations || []).map((generation) => ({
      ...generation,
      outputUrl: generation.outputUrl
        ? generation.outputUrl.startsWith("http")
          ? generation.outputUrl
          : `${API_BASE_URL}${generation.outputUrl}`
        : "",
      previewUrl: generation._id
        ? `${API_BASE_URL}/api/doctors/generations/file/${encodeURIComponent(generation._id)}`
        : "",
      downloadUrl: generation._id
        ? `${API_BASE_URL}/api/doctors/generations/download/${encodeURIComponent(generation._id)}`
        : "",
    })),
  };
};

export const fetchGenerationBlobUrl = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error("Generated file URL is missing.");
  }

  const response = await fetch(
    `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}ngrok-skip-browser-warning=true`,
    {
      method: "GET",
      headers: API_HEADERS,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load generated file (HTTP ${response.status}).`);
  }

  const blob = await response.blob();

  if (!blob.size) {
    throw new Error("Generated file is empty.");
  }

  return URL.createObjectURL(blob);
};

export const downloadDoctorGeneration = async (fileUrl, filename) => {
  const blobUrl = await fetchGenerationBlobUrl(fileUrl);

  try {
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename || "igreet-generation.png";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }
};
