import API_URL from "./api";

interface TaskPayload {
  title: string;
  description: string;
  status?: string;
  assigned_employee_id: number | null;
}

const getToken = () => {
  try {
    const authStorage =
      localStorage.getItem(
        "auth-storage"
      );

    if (!authStorage) {
      return null;
    }

    const parsed =
      JSON.parse(authStorage);

    return (
      parsed?.state?.token ||
      null
    );
  } catch {
    return null;
  }
};

const getRefreshToken = () => {
  try {
    const authStorage =
      localStorage.getItem(
        "auth-storage"
      );

    if (!authStorage) {
      return null;
    }

    const parsed =
      JSON.parse(authStorage);

    return (
      parsed?.state
        ?.refreshToken || null
    );
  } catch {
    return null;
  }
};

const refreshAccessToken =
  async () => {
    const refreshToken =
      getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "No Refresh Token"
      );
    }

    const response = await fetch(
      `${API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          refresh_token:
            refreshToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Refresh failed"
      );
    }

    const data =
      await response.json();

    const authStorage =
      localStorage.getItem(
        "auth-storage"
      );

    if (authStorage) {
      const parsed =
        JSON.parse(authStorage);

      parsed.state.token =
        data.access_token;

      localStorage.setItem(
        "auth-storage",
        JSON.stringify(parsed)
      );
    }

    document.cookie =
      `access_token=${data.access_token}; path=/`;

    return data.access_token;
  };

export const getTasks =
  async () => {
    let token = getToken();

    if (!token) {
      return [];
    }

    let response =
      await fetch(
        `${API_URL}/tasks`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (
      response.status === 401
    ) {
      try {
        token =
          await refreshAccessToken();

        response =
          await fetch(
            `${API_URL}/tasks`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );
      } catch (error) {
        console.error(
          "Refresh Failed",
          error
        );

        localStorage.removeItem(
          "auth-storage"
        );

        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        window.location.replace(
          "/login"
        );

        return [];
      }
    }

    return response.json();
  };

export const createTask =
  async (payload: TaskPayload) => {
    const token =
      getToken();

    const response =
      await fetch(
        `${API_URL}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

    return response;
  };

export const updateTask =
  async (
    id: number,
    payload: TaskPayload
  ) => {
    const token =
      getToken();

    const response =
      await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

    return response;
  };

export const deleteTask =
  async (id: number) => {
    const token =
      getToken();

    const response =
      await fetch(
        `${API_URL}/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response;
  };