import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Tu configuración (la que me has pasado)
const firebaseConfig = {
  apiKey: "AIzaSyD352RiwJF2TZGCDmzPDBNZuTaCTQyqEho",
  authDomain: "todo-list-serganu.firebaseapp.com",
  projectId: "todo-list-serganu",
  storageBucket: "todo-list-serganu.firebasestorage.app",
  messagingSenderId: "87459649104",
  appId: "1:87459649104:web:6392a3de517ac74cbaa355",
  measurementId: "G-3T3F17CYD3"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar la Base de Datos (Firestore)
export const db = getFirestore(app);

/* ... config ... */
/* ... app ... */

// Inicializar y exportar Auth y Proveedor
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
/* ... export const db ... */