// Firebase configuration for push notifications
// Note: Install firebase package first: npm install firebase

const firebaseConfig = {
  apiKey: "AIzaSyA5VHL5A_pxAYCmzHlNuwBDnLieucE8laY",
  authDomain: "baddelha-d3e96.firebaseapp.com",
  projectId: "baddelha-d3e96",
  storageBucket: "baddelha-d3e96.firebasestorage.app",
  messagingSenderId: "885700467987",
  appId: "1:885700467987:web:dcd2a5fe7c157242b34ee6"
};



// VAPID Key - Generate from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = "BOw4b2GBO4rNDXLVAu__GWpTInpZrd-6dptV2p5-6PQsFpm3kqom7kVWKtSRPnhJ0F_pVFrJ9BvinzeqAdj3Htw";

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
