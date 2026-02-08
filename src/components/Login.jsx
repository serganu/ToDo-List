// src/components/Login.jsx
import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase'; // Importamos nuestra config

function Login() {
  
  // Función para manejar el clic
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al entrar:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Bienvenido a Mis Tareas 📝</h1>
      <p>Inicia sesión para ver y editar la lista compartida.</p>
      
      <button onClick={handleLogin} className="google-btn">
        <img 
          src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" 
          alt="G" 
          width="20" 
        />
        Entrar con Google
      </button>
    </div>
  );
}

export default Login;