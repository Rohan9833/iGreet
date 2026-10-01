const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

const API_HEADERS = {
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
}) => {
  const response = await fetch(`${API_BASE_URL}/api/doctors/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...API_HEADERS,
    },
    body: JSON.stringify({
      qrToken,
      template,
      receiverName,
      senderName,
    }),
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
