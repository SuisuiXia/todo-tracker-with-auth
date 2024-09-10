
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBgkh14fdNRF8tgmqIZfbbiLpacuVp0F3E",
  authDomain: "demo1-9ab1c.firebaseapp.com",
  projectId: "demo1-9ab1c",
  storageBucket: "demo1-9ab1c.appspot.com",
  messagingSenderId: "849607572310",
  appId: "1:849607572310:web:85cd5c61798a4bfa4e34f7",
  measurementId: "G-1HWTR5ZF51"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };