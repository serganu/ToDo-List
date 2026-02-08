// app.js - VERSIÓN LIMPIA Y FINAL
import { db, auth, provider } from './firebase-config.js';
import { 
    collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    signInWithPopup, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Función auxiliar para fechas (Fuera del DOMContentLoaded)
function formatearFecha(timestamp) {
    if (!timestamp) return '';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. REFERENCIAS DOM
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Referencias de Login
    const loginScreen = document.getElementById('loginScreen');
    const appScreen = document.getElementById('appScreen');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userPhoto = document.getElementById('userPhoto');
    const userName = document.getElementById('userName');

    const tasksCollection = collection(db, "tareas");
    let unsubscribe = null; // Para detener la escucha de tareas al salir

    // 2. FUNCIONES PRINCIPALES

    function createTaskElement(id, data) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = id;
        
        if (data.completada) li.classList.add('completed');

        // Textos
        const fechaCreacion = formatearFecha(data.fechaCreacion);
        const infoCreacion = `Creado por ${data.creadaPorNombre || 'Anónimo'} el ${fechaCreacion}`;
        let infoCompletado = '';
        
        if (data.completada && data.completadaPor) {
            infoCompletado = `<br>✅ Completado por ${data.completadaPor} el ${formatearFecha(data.fechaCompletada)}`;
        }

        li.innerHTML = `
            <div class="task-info">
                <span class="task-content">${data.texto}</span>
                <small class="task-creator">
                    ${infoCreacion}
                    <span class="completed-info">${infoCompletado}</span>
                </small>
            </div>
            <div class="action-buttons">
                <button class="delete-btn" aria-label="Borrar">✕</button>
            </div>
        `;

        // Eventos de la tarea
        const deleteBtn = li.querySelector('.delete-btn');
        
        // BORRAR
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if(!confirm("¿Seguro que quieres borrarla?")) return; // Mini seguridad extra
            
            li.classList.add('fall');
            try {
                await deleteDoc(doc(db, "tareas", id));
            } catch (error) {
                console.error(error);
            }
        });

        // COMPLETAR
        li.addEventListener('click', async () => {
            try {
                const nuevoEstado = !li.classList.contains('completed');
                const user = auth.currentUser;
                const updateData = { completada: nuevoEstado };

                if (nuevoEstado) {
                    updateData.completadaPor = user.displayName;
                    updateData.fechaCompletada = new Date();
                } else {
                    updateData.completadaPor = null;
                    updateData.fechaCompletada = null;
                }
                await updateDoc(doc(db, "tareas", id), updateData);
            } catch (error) {
                console.error(error);
            }
        });

        // EDITAR
        li.addEventListener('dblclick', async () => {
             const nuevoTexto = prompt("Editar tarea:", data.texto);
             if (nuevoTexto && nuevoTexto.trim() !== "") {
                 try {
                     await updateDoc(doc(db, "tareas", id), { texto: nuevoTexto });
                 } catch (error) {
                     console.error(error);
                 }
             }
        });

        return li;
    }

    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;

        try {
            const user = auth.currentUser;
            await addDoc(tasksCollection, {
                texto: taskText,
                completada: false,
                fechaCreacion: new Date(),
                creadaPorNombre: user.displayName,
                creadaPorEmail: user.email,
                creadaPorFoto: user.photoURL
            });
            taskInput.value = "";
            taskInput.focus();
        } catch (error) {
            console.error("Error al añadir:", error);
            alert("Error al guardar: " + error.message);
        }
    }

    function checkEmptyState() {
        if (taskList.children.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    function applyFilter() {
        const activeBtn = document.querySelector('.filter-btn.active');
        if(!activeBtn) return;
        const filterValue = activeBtn.getAttribute('data-filter');
        const tasks = document.querySelectorAll('.task-item');
        
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');
            let shouldShow = false;
            
            if (filterValue === 'all') shouldShow = true;
            else if (filterValue === 'pending' && !isCompleted) shouldShow = true;
            else if (filterValue === 'completed' && isCompleted) shouldShow = true;

            task.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    // 3. EVENTOS GLOBALES

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            applyFilter();
        });
    });

    // 4. AUTENTICACIÓN

    loginBtn.addEventListener('click', async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            alert("Error login: " + error.message);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Entramos
            loginScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');
            userName.innerText = user.displayName;
            userPhoto.src = user.photoURL;
            cargarTareas();
        } else {
            // Salimos
            appScreen.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            taskList.innerHTML = "";
            if(unsubscribe) unsubscribe(); // Parar de escuchar datos
        }
    });

    function cargarTareas() {
        const q = query(tasksCollection, orderBy("fechaCreacion", "desc"));
        unsubscribe = onSnapshot(q, (snapshot) => {
            taskList.innerHTML = "";
            snapshot.forEach((doc) => {
                const li = createTaskElement(doc.id, doc.data());
                taskList.appendChild(li);
            });
            checkEmptyState();
            applyFilter();
        });
    }
});