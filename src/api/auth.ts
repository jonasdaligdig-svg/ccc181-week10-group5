export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function login(email: string, password: string): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please try again.", 0);
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new ApiError("Wrong email or password.", response.status);
    }
    if (response.status >= 500) {
      throw new ApiError("Something went wrong on our side. Please try again later.", response.status);
    }
    throw new ApiError("Wrong email or password.", response.status);
  }

  return await response.json();
}

export async function getMe(token: string): Promise<User> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new ApiError("Cannot reach the server. Please try again.", 0);
  }

  if (!response.ok) {
    throw new ApiError("Not logged in.", response.status);
  }

  return await response.json();
}
        