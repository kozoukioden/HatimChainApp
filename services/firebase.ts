// Firebase configuration for Hatim Zinciri App
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCOEHFwQE7BHT-G3DuPtLJjsxy04au3YqA",
    authDomain: "hatim-zinciri-app.firebaseapp.com",
    projectId: "hatim-zinciri-app",
    storageBucket: "hatim-zinciri-app.firebasestorage.app",
    messagingSenderId: "411049527311",
    appId: "1:411049527311:android:b28edfd91a62ac8dbbfb7a"
};

const app = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export default app;
