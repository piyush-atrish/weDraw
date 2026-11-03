import type { IncomingMessage } from "http";
import { verifyToken } from "@repo/backend-packages/jwt.utils";
import "dotenv/config";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";

const getCookie = (header: string | undefined, name: string) => {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
};

export const authenticate = (request: IncomingMessage) => {
  if (request.headers.origin !== ALLOWED_ORIGIN) return null;

  const token = getCookie(request.headers.cookie, "token");
  if (!token) return null;

  try {
    const userId = Number(verifyToken(token, process.env.JWT_USER!));
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
};