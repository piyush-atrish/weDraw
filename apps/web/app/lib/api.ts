import axios from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}


export const api = axios.create({
  baseURL:
  process.env.NODE_ENV === "development" ? "http://localhost:3001/api/v1" : "/api/v1",
  withCredentials: true,
  timeout: 10_000,
});


api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      if (!error.response) {
        return Promise.reject(new ApiError("Cannot reach the server. Please try again.", 0));
      }
      return Promise.reject(
        new ApiError(error.response.data?.message ?? "Something went wrong", error.response.status),
      );
    }
    return Promise.reject(error);
  },
);