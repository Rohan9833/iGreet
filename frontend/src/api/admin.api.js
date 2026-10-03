const getAdminAuthHeaders = () => {
  const token = localStorage.getItem("igreet_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isLocalHost = (hostname) => {
  if (!hostname) return false;

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return true;
  }

  if (hostname.startsWith("10.")) return true;
  if (hostname.startsWith("192.168.")) return true;

  const parts = hostname.split(".");

  if (parts.length === 4 && parts[0] === "172") {
    const secondPart = Number(parts[1]);
    return secondPart >= 16 && secondPart <= 31;
  }

  return false;
};

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    // During local Vite development, talk directly to the local backend.
    // This avoids routing browser API calls through an ngrok tunnel and
    // prevents the ngrok browser-warning/CORS layer from breaking requests.
    if (import.meta.env.DEV && isLocalHost(hostname)) {
      return `${protocol}//${hostname}:5000`;
    }
  }

  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();

const API_HEADERS = {
  Accept: "application/json",
  ...(API_BASE_URL.includes("ngrok")
    ? { "ngrok-skip-browser-warning": "true" }
    : {}),
};

const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...API_HEADERS,
        ...getAdminAuthHeaders(),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Unable to connect to the backend at ${API_BASE_URL}. Make sure the backend is running.`,
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `The backend returned an invalid response for ${path} (HTTP ${response.status}).`,
    );
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || `Request failed with HTTP ${response.status}.`,
    );
  }

  return data;
};

const getFileNameFromUrl = (imageUrl) => {
  if (!imageUrl) return "";

  try {
    const url = new URL(imageUrl);
    return decodeURIComponent(url.pathname.split("/").pop() || "");
  } catch {
    return imageUrl.split("/").pop() || "";
  }
};

export const getQrImageUrl = (imageUrl) => {
  const fileName = getFileNameFromUrl(imageUrl);

  if (!fileName) return "";

  return `${API_BASE_URL}/qrcodes/${encodeURIComponent(fileName)}`;
};

export const getQrDownloadUrl = (imageUrl) => {
  const fileName = getFileNameFromUrl(imageUrl);

  if (!fileName) return "";

  return `${API_BASE_URL}/qrcodes/download/${encodeURIComponent(fileName)}`;
};

export const getAdminDashboard = async () => request("/api/admin/dashboard");

export const getAdminQRCodes = async () => {
  const data = await request("/api/qr");
  return Array.isArray(data.qrCodes) ? data.qrCodes : [];
};

export const generateAdminQRCodes = async (quantity) => {
  const data = await request("/api/qr/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: Number(quantity) }),
  });

  return Array.isArray(data.qrCodes) ? data.qrCodes : [];
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

export const getAdminMRs = async (search = "", page = 1, limit = 25) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  const data = await request(`/api/admin/mrs?${params.toString()}`);

  return {
    mrs: Array.isArray(data.mrs) ? data.mrs : [],
    pagination: data.pagination || {
      page,
      limit,
      total: data.count || 0,
      totalPages: Math.ceil((data.count || 0) / limit),
    },
  };
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
