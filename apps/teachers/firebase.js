import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';
// import config from './config.json';
import firebaseConfig from './firebaseConfig';

const firebaseApp = initializeApp(firebaseConfig);
let messaging;
console.log("messaging",messaging)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging();
} else {
  console.warn('Service workers are not supported in this environment.');
}

export const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  try {
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
      });
      return token;
    } else {
      console.log('Permission failed');
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      console.log("hoiiiii")
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });
