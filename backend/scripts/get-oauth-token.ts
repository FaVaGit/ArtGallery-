/**
 * One-time helper to obtain a Google OAuth2 refresh token.
 *
 * Prerequisites:
 *   1. Go to https://console.cloud.google.com/apis/credentials
 *   2. Click "Create Credentials" → "OAuth client ID"
 *   3. Application type: "Web application"
 *   4. Add "http://localhost:3333" to "Authorized redirect URIs"
 *   5. Copy the Client ID and Client Secret
 *
 * Usage:
 *   npx tsx backend/scripts/get-oauth-token.ts <CLIENT_ID> <CLIENT_SECRET>
 *
 * This will open a browser window. Sign in with the Gmail account that
 * owns the Drive folder. The script prints a REFRESH_TOKEN to paste
 * into your Render environment variables.
 */

import http from "node:http";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const REDIRECT_URI = "http://localhost:3333";

const clientId = process.argv[2];
const clientSecret = process.argv[3];

if (!clientId || !clientSecret) {
  console.error(
    "\nUsage: npx tsx backend/scripts/get-oauth-token.ts <CLIENT_ID> <CLIENT_SECRET>\n\n" +
    "Get your Client ID and Secret from:\n" +
    "  https://console.cloud.google.com/apis/credentials\n",
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n=== Google OAuth2 Setup ===\n");
console.log("1. Open this URL in your browser:\n");
console.log(`   ${authUrl}\n`);
console.log("2. Sign in with the Gmail account that owns the Drive folder.");
console.log("3. Grant access. You will be redirected back here.\n");
console.log("Waiting for redirect on http://localhost:3333 ...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h2>Error: no authorization code received.</h2>");
    return;
  }

  try {
    const { tokens } = await oauth2.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h2>&#10004; Success! You can close this window.</h2>" +
      "<p>Go back to the terminal to copy your refresh token.</p>",
    );

    console.log("=== SUCCESS ===\n");
    console.log("Add these environment variables to Render:\n");
    console.log(`  GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
    console.log(`  GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
    console.log(`  GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log("Then redeploy the backend on Render.\n");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h2>Error exchanging code for token</h2><pre>${err}</pre>`);
    console.error("Token exchange failed:", err);
  } finally {
    setTimeout(() => process.exit(0), 500);
  }
});

server.listen(3333);
