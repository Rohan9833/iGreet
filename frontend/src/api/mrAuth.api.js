const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://duplex-slate-kilobyte.ngrok-free.dev"
).replace(/\/$/, "");

const API_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

const TOKEN_KEY = "igreet_mr_token";
const MR_KEY = "igreet_mr_user";

export const loginMr = async ({ mrId, mrPassword }) => {
  const response = await fetch(`${API_BASE_URL}/api/mr-auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...API_HEADERS,
    },
    body: JSON.stringify({ mrId, mrPassword }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Unable to login.");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(MR_KEY, JSON.stringify(data.mr));

  return data;
};

export const getMrToken = () => localStorage.getItem(TOKEN_KEY);

export const getLoggedInMr = () => {
  const value = localStorage.getItem(MR_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const logoutMr = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MR_KEY);
};
