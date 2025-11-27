// functions/index.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const axios = require("axios");

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");

// GEN-2 default config
setGlobalOptions({
  region: "us-central1",
  cpu: 1,
});

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/* ============================================================
   1) LinkedIn Login
============================================================ */
app.post("/linkedinAuth", async (req, res) => {
  try {
    const code = req.body.code;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = "http://localhost:5173/auth/linkedin/callback";

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;

    const profile = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const uid = profile.data.sub;

    let user;
    try {
      user = await admin.auth().getUser(uid);
    } catch (_) {
      user = await admin.auth().createUser({
        uid,
        email: profile.data.email,
        emailVerified: true,
        displayName: profile.data.name,
        photoURL: profile.data.picture,
      });
    }

    const customToken = await admin.auth().createCustomToken(uid);

    return res.json({ token: customToken });

  } catch (err) {
    console.error("linkedinAuth Error →", err);
    res.status(500).json({ error: "Internal error" });
  }
});

/* ============================================================
   2) Save LinkedIn Tokens
============================================================ */
app.post("/saveLinkedInTokens", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "Missing bearer token" });

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const code = req.body.code;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri =
      "http://localhost:5173/auth/linkedin/connect-callback";

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;

    await admin.firestore().doc(`users/${uid}`).set(
      {
        linkedin: {
          accessToken,
          connectedAt: admin.firestore.Timestamp.now(),
        },
      },
      { merge: true }
    );

    res.json({ success: true });

  } catch (err) {
    console.error("saveLinkedInTokens Error →", err);
    res.status(500).json({ error: "Internal error" });
  }
});

/* ============================================================
   3) Publish Post
============================================================ */
app.post("/publishPost", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "Missing bearer token" });

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const content = req.body?.content;
    if (!content) return res.status(400).json({ error: "Empty content" });

    const userDoc = await admin.firestore().doc(`users/${uid}`).get();
    const token = userDoc.data().linkedin?.accessToken;

    if (!token)
      return res.status(400).json({ error: "LinkedIn not connected" });

    // ✅ FIX: LinkedIn Profile Endpoint (Correct One)
    const profile = await axios.get("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const linkedInId = profile.data.id;  // <-- USE THIS

    const postBody = {
      author: `urn:li:person:${linkedInId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const post = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      postBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    return res.json({ success: true, id: post.data.id });

  } catch (err) {
    console.error("publishPost Error →", err.response?.data || err);
    res.status(500).json({ error: "Internal error" });
  }
});
exports.api = onRequest(app);