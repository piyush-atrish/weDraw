import { OAuth2Client } from "google-auth-library";
import { AppError } from "../utils/AppError.js";

const client = new OAuth2Client();

export async function verifyGoogleCredential(credential: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");

    try {
        const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
        const p = ticket.getPayload();
        if (!p?.sub || !p.email || !p.email_verified) throw new Error("unverified google account");
        return { googleId: p.sub, email: p.email.toLowerCase(), name: p.name ?? null };
    } catch {
        throw new AppError("Google sign-in failed", 401);
    }
}