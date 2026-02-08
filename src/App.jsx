import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc, query, orderBy 
} from 'firebase/firestore';
import { auth, db } from './firebase';

import Login from './components/Login';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); // ¡Aquí guardamos las tareas!
  const [loading, setLoading] = useState(true);

  // 1. Escuchar Usuario
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Escuchar Tareas (Solo si hay usuario)
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(collection(db, "tareas"), orderBy("fechaCreacion", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      // Magia de React: Convertimos snapshot a array simple
      const newTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(newTasks);
    });

    return () => unsub();
  }, [user]); // Se ejecuta cuando 'user' cambia

  // --- ACCIONES ---

  const addTask = async (texto) => {
    await addDoc(collection(db, "tareas"), {
      texto,
      completada: false,
      fechaCreacion: new Date(),
      creadaPorNombre: user.displayName,
      creadaPorEmail: user.email,
      creadaPorFoto: user.photoURL
    });
  };

  const toggleTask = async (task) => {
    const nuevoEstado = !task.completada;
    await updateDoc(doc(db, "tareas", task.id), {
      completada: nuevoEstado,
      completadaPor: nuevoEstado ? user.displayName : null,
      fechaCompletada: nuevoEstado ? new Date() : null
    });
  };

  const deleteTask = async (id) => {
    if(confirm("¿Borrar tarea?")) {
      await deleteDoc(doc(db, "tareas", id));
    }
  };
  
  const editTask = async (task) => {
    const nuevoTexto = prompt("Editar:", task.texto);
    if (nuevoTexto) {
        await updateDoc(doc(db, "tareas", task.id), { texto: nuevoTexto });
    }
  };


  if (loading) return <p>Cargando...</p>;

  if (!user) return <Login />;

  return (
    <div className="app-container">
      <header>
          <div className="user-info">
            <img src={user.photoURL} alt="Avatar" className="avatar" />
            <button onClick={() => signOut(auth)} className="logout-btn">Salir</button>
        </div>
        <h1>Mis Tareas</h1>
      </header>

      <TaskInput onAddTask={addTask} />

      <ul className="task-list">
        {tasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onToggle={toggleTask} 
            onDelete={deleteTask}
            onEdit={editTask}
          />
        ))}
      </ul>
      
      {tasks.length === 0 && (
          <div className="empty-state"><p>¡Lista vacía! Añade algo.</p></div>
      )}
    </div>
  );
}

export default App;