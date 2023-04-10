import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDc14lFLWp4LHyRZwPC2q6FGCJ7Vi3SDm8",
  authDomain: "vendswap.firebaseapp.com",
  projectId: "vendswap",
  storageBucket: "vendswap.appspot.com",
  messagingSenderId: "1095920328516",
  appId: "1:1095920328516:web:2d40a91904d4b2e6670111",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
export const db = getFirestore(app);
