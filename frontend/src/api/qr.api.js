const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev").replace(/\/$/, "");

export const getQRByToken = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/qr/${encodeURIComponent(token)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to verify this QR code.");
  }

  return data.qr;
};
