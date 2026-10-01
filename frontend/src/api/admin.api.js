const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

const API_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...API_HEADERS,
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Unable to load admin data.");
  }

  return data;
};

export const getAdminQRCodes = async () => {
  const data = await request("/api/qr");
  return data.qrCodes || [];
};

export const generateAdminQRCodes = async (quantity) => {
  const data = await request("/api/qr/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity: Number(quantity) }),
  });

  return data.qrCodes || [];
};

export const getDoctorByQRToken = async (token) => {
  const data = await request(
    `/api/doctors/by-qr/${encodeURIComponent(token)}`,
  );
  return data.doctor || null;
};
