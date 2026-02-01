"use client";

import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let messaging: any = null;

if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.log("Firebase not configured:", error);
  }
}

export async function requestNotificationPermission() {
  try {
    if (!messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await messaging.getToken({
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
}

export function setupMessageListener(callback: (message: any) => void) {
  if (messaging) {
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      callback(payload);
    });
  }
}
