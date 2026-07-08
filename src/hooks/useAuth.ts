export const useAuth = () => {
  const getToken = () => {
    const cookies = document.cookie.split("; ");

    const tokenCookie = cookies.find((row) =>
      row.startsWith("access_token=")
    );

    return tokenCookie
      ? tokenCookie.split("=")[1]
      : null;
  };

  const isAuthenticated = () => {
    return !!getToken();
  };

  const logout = () => {
  document.cookie =
    "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  localStorage.removeItem(
    "auth-storage"
  );

  window.location.href =
    "/login";
};

  return {
    getToken,
    isAuthenticated,
    logout,
  };
};