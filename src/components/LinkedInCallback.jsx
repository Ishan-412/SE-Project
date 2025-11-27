// src/components/LinkedInCallback.jsx
import React, { useEffect } from "react";
import { auth } from "../firebase"; // your exported auth instance
import { onAuthStateChanged } from "firebase/auth";

const LinkedInCallback = () => {
  useEffect(() => {
    const doProcess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (!code) {
        alert("LinkedIn did not return a code.");
        return;
      }

      // Wait for Firebase auth to be available
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log("User not logged in yet — cannot connect LinkedIn.");
          alert("Please login to your account first and try again.");
          return;
        }

        try {
          const idToken = await user.getIdToken();

          // Call Gen2 HTTP endpoint (saveLinkedInTokens)
          const resp = await fetch("https://us-central1-agentic-ai-58b57.cloudfunctions.net/saveLinkedInTokens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify({ code }),
          });

          const result = await resp.json();
          console.log("Server response:", result);

          if (!resp.ok) {
            console.error("Failed server response:", result);
            alert("Failed to connect LinkedIn: " + (result.error || result.message || resp.statusText));
            return;
          }

          alert("LinkedIn connected successfully!");
          window.location.href = "/dashboard";
        } catch (err) {
          console.error("Error saving LinkedIn tokens:", err);
          alert("Failed to connect LinkedIn. See console for details.");
        }
      });
    };

    doProcess();
  }, []);

  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold">Connecting your LinkedIn...</h2>
      <p>Please wait...</p>
    </div>
  );
};

export default LinkedInCallback;
