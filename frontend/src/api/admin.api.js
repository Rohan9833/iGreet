const getAdminAuthHeaders = () => {\n  const token = localStorage.getItem("igreet_admin_token");\n  return token ? { Authorization: `Bearer ${token}` } : {};\n};\n\nconst API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

const API_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...API_HEADERS, ...(getAdminAuthHeaders()), ...(options.headers || {}) },
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

export const getAdminDashboard = async () => request("/api/admin/dashboard");

export const getAdminQRCodes = async () => {
  const data = await request("/api/qr");
  return data.qrCodes || [];
};

export const generateAdminQRCodes = async (quantity) => {
  const data = await request("/api/qr/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: Number(quantity) }),
  });
  return data.qrCodes || [];
};

export const unassignAdminQR = async (id) =>
  request(`/api/admin/qr/${encodeURIComponent(id)}/unassign`, {
    method: "PATCH",
  });

export const updateAdminQRStatus = async (id, status) =>
  request(`/api/admin/qr/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

export const getAdminDoctors = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await request(`/api/admin/doctors${query}`);
  return data.doctors || [];
};

export const getAdminDoctorDetails = async (id) => {
  const data = await request(`/api/admin/doctors/${encodeURIComponent(id)}`);
  return data;
};

export const getAdminMRs = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await request(`/api/admin/mrs${query}`);
  return data.mrs || [];
};

export const getAdminGenerations = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await request(`/api/admin/generations${query}`);
  return data.generations || [];
};

export const getHierarchySummary = async () => {
  const data = await request("/api/admin/hierarchy-summary");
  return data.hierarchy;
};
