// Importamos las funciones necesarias desde la web (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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