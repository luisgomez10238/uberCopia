// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
 
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAK_Qq0t9K0vxABoGN7Q2dYYapeIwzMXy8",
  authDomain: "uber-4e803.firebaseapp.com",
  projectId: "uber-4e803",
  storageBucket: "uber-4e803.firebasestorage.app",
  messagingSenderId: "130509202016",
  appId: "1:130509202016:web:50de7d9153ee4e04965905",
  measurementId: "G-45CM4VJ3EW"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = initializeAuth(app, {   persistence: getReactNativePersistence(AsyncStorage), });
const db = getFirestore(app); // Exportar para usar en tus pantallas o componentesexport { app, auth, db };
