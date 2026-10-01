const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

const API_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

export const loginAdmin = async ({ loginId, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/admin-auth/login`, {
    method: "POST",
    headers: { ...API_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ loginId, password }),
  });

  let data;
  try { data = await response.json(); } catch { throw new Error("The server returned an invalid response."); }

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Unable to login.");
  }

  localStorage.setItem("igreet_admin_token", data.token);
  localStorage.setItem("igreet_admin_user", JSON.stringify(data.user));
  return data;
};

export const getAdminToken = () => localStorage.getItem("igreet_admin_token");

export const getAdminUser = () => {
  try { return JSON.parse(localStorage.getItem("igreet_admin_user") || "null"); } catch { return null; }
};

export const logoutAdmin = () => {
  localStorage.removeItem("igreet_admin_token");
  localStorage.removeItem("igreet_admin_user");
};
