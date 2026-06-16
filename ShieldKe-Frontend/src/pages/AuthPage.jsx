export const getUser = () => {
  const raw = localStorage.getItem("user");

  if (!raw || raw === "undefined") return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse user:", err);
    return null;
  }
};

export const getToken = () => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined" ? token : null;
};

export const saveAuth = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
};

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};
