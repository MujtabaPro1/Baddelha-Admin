importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAjrGrwv0BEAyZsMvv8dp0tWx5M-iYamYg",
  authDomain: "baddelha-337ea.firebaseapp.com",
  projectId: "baddelha-337ea",
  storageBucket: "baddelha-337ea.firebasestorage.app",
  messagingSenderId: "1018573259779",
  appId: "1:1018573259779:web:3eabbdbb7f2e48d2293a36",
  measurementId: "G-WWVCR0MDTL"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data,
    tag: payload.data?.inspectionId || 'notification',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  event.notification.close();

  const inspectionId = event.notification.data?.inspectionId;
  const url = inspectionId ? `/inspections/${inspectionId}` : '/inspections';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
