import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {
  try {
    console.log("🔐 Verifying Google ID token...");
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    console.log("✅ Google token verified");
    console.log("User ID:", payload.sub);
    console.log("User Email:", payload.email);
    
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
      given_name: payload.given_name,
      family_name: payload.family_name,
      locale: payload.locale,
      hd: payload.hd
    };
  } catch (error) {
    console.error("❌ Google token verification failed:", error.message);
    throw new Error("Invalid Google token: " + error.message);
  }
};

// Also export as default for compatibility
export default { verifyGoogleToken };