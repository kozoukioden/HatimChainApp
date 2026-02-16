// Firebase configuration for Hatim Zinciri App
import { initializeApp } from 'firebase/app';
import { initializeFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCOEHFwQE7BHT-G3DuPtLJjsxy04au3YqA",
    authDomain: "hatim-zinciri-app.firebaseapp.com",
    projectId: "hatim-zinciri-app",
    storageBucket: "hatim-zinciri-app.firebasestorage.app",
    messagingSenderId: "411049527311",
    appId: "1:411049527311:android:b28edfd91a62ac8dbbfb7a"
};

const app = initializeApp(firebaseConfig);

// React Native requires long polling - default WebChannel transport doesn't work
export const db: Firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

export default app;
