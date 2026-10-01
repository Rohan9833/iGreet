const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

export const registerDoctor = async (doctorData) => {
  const response = await fetch(`${API_BASE_URL}/api/doctors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(doctorData),
  });

  let data;
  try { data = await response.json(); }
  catch { throw new Error("The server returned an invalid response."); }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to register the doctor.");
  }
  return data;
};

export const getDoctorByQRToken = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/api/doctors/by-qr/${encodeURIComponent(token)}`,
    { headers: { Accept: "application/json" } }
  );

  let data;
  try { data = await response.json(); }
  catch { throw new Error("The server returned an invalid response."); }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to load doctor details.");
  }
  return data;
};
