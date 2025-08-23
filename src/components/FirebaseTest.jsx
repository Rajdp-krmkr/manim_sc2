"use client";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function FirebaseTest() {
  useEffect(() => {
    console.log("Firebase Auth instance:", auth);
    console.log("Firebase Auth app:", auth.app);
    console.log("Firebase Auth config:", auth.config);

    // Test if Firebase is properly initialized
    if (auth && auth.app) {
      console.log("✅ Firebase is properly initialized");
      console.log("Project ID:", auth.app.options.projectId);
      console.log("Auth Domain:", auth.app.options.authDomain);
    } else {
      console.log("❌ Firebase initialization failed");
    }
  }, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h3>Firebase Debug Info</h3>
      <p>Check browser console for Firebase configuration details</p>
    </div>
  );
}
