import { verifyToken } from "@repo/backend-packages/jwt.utils";
import "dotenv/config";

export const authenticate = (url?: string) => {
  if (!url) return null;
  try {
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token =  queryParams.get('token') || "";
    const result = verifyToken(token, process.env.JWT_USER!);
    const userId = Number(result);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}