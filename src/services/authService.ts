import API_URL from "./api";

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  return response;
};

interface SignupPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export const signupUser = async (
  payload: SignupPayload
) => {
  const response = await fetch(
    `${API_URL}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return response;
};