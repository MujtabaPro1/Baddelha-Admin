// Firebase configuration for push notifications
// Note: Install firebase package first: npm install firebase

const firebaseConfig = {
  apiKey: "AIzaSyAjrGrwv0BEAyZsMvv8dp0tWx5M-iYamYg",
  authDomain: "baddelha-337ea.firebaseapp.com",
  projectId: "baddelha-337ea",
  storageBucket: "baddelha-337ea.firebasestorage.app",
  messagingSenderId: "1018573259779",
  appId: "1:1018573259779:web:3eabbdbb7f2e48d2293a36",
  measurementId: "G-WWVCR0MDTL"
};

// VAPID Key - Generate from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = "BHQyOUyKUBp6fYpq44bBGp21ruqZ8LCSzN4dYG2BnqCRxSdQV0-9WqpMQs_m_WO__aqgqLfP9WzV2oeKzR2q8UA";

let app: any = null;
let messaging: any = null;

export const initializeFirebase = async () => {
  if (app) return { app, messaging };
  
  try {
    const { initializeApp } = await import("firebase/app");
    const { getMessaging } = await import("firebase/messaging");
    
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    
    return { app, messaging };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { app: null, messaging: null };
  }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const { getToken } = await import("firebase/messaging");
      await initializeFirebase();
      
      if (!messaging) return null;
      
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log("FCM Token:", token);
      return token;
    }
    console.log("Notification permission denied");
    return null;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

export const onMessageListener = (): Promise<any> => {
  return new Promise(async (resolve) => {
    const { onMessage } = await import("firebase/messaging");
    await initializeFirebase();
    
    if (!messaging) {
      resolve(null);
      return;
    }
    
    onMessage(messaging, (payload: any) => {
      resolve(payload);
    });
  });
};

export { firebaseConfig };
