const TOKEN_KEY = "hexToken";

export const getAuthToken = () => {
  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${TOKEN_KEY}=`))
    ?.split("=")[1];

  if (cookieToken) {
    return cookieToken;
  }

  return localStorage.getItem(TOKEN_KEY) || "";
};

export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Lax; max-age=315360000`;
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
