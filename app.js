// Importamos la conexión a la base de datos
import { db } from './firebase-config.js';
// Importamos las funciones mágicas de Firestore
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    updateDoc,
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Esperamos a que el contenido de la página cargue
document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionamos los elementos del HTML que vamos a controlar
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Referencia a la colección de tareas en la base de datos
    const tasksCollection = collection(db, "tareas");

    // Función reutilizable para crear la fila de la tarea
    function createTaskElement(id, texto, completada = false) {
        // 1. Crear el elemento li
        const li = document.createElement('li');
        li.className = 'task-item';
        // Guardamos el ID de Firebase en el elemento HTML para saber quién es
        li.dataset.id = id; 
        
        if (completada) {
            li.classList.add('completed');
        }

        // 2. Insertar HTML
        li.innerHTML = `
            <span class="task-content">${texto}</span>
            <div class="action-buttons">
                <button class="delete-btn" aria-label="Borrar">🗑️</button>
            </div>
        `;
        
        // --- EVENTOS (Ahora hablan con Firestore) ---

        // BORRAR TAREA
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            li.classList.add('fall');

            // Importante: No borramos del HTML aquí.
            // Le decimos a Firebase que borre. 
            // Cuando Firebase lo haga, el "oyente" (onSnapshot) actualizará la lista.
            try {
                await deleteDoc(doc(db, "tareas", id));
            } catch (error) {
                console.error("Error al borrar:", error);
                alert("Hubo un error al borrar la tarea");
            }
        });

        // COMPLETAR TAREA (Toggle)
        li.addEventListener('click', async () => {
            // Le decimos a Firebase que cambie SOLO el campo 'completada'
            try {
                const nuevoEstado = !li.classList.contains('completed');
                await updateDoc(doc(db, "tareas", id), {
                    completada: nuevoEstado
                });
            } catch (error) {
                console.error("Error al actualizar:", error);
            }
        });

        // EDITAR TAREA (Doble Click)
        li.addEventListener('dblclick', async () => {
             const taskContent = li.querySelector('.task-content');
             const nuevoTexto = prompt("Editar tarea:", taskContent.innerText);
             
             if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
                 try {
                     await updateDoc(doc(db, "tareas", id), {
                         texto: nuevoTexto
                     });
                 } catch (error) {
                     console.error("Error al editar:", error);
                 }
             }
        });

        return li;
    }

    // 2. Función para añadir una nueva tarea
    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") {
            alert("Por favor escribe una tarea 🎉");
            return;
        }

        try {
            // Guardamos en Firebase (Magia ✨)
            await addDoc(tasksCollection, {
                texto: taskText,
                completada: false,
                fechaCreacion: new Date() // Para ordenar luego
            });
            
            // Limpiamos el input
            taskInput.value = "";
            taskInput.focus();
        } catch (error) {
            console.error("Error al añadir tarea: ", error);
            alert("Error al guardar en la nube");
        }
    }

    // 3. Función auxiliar para mostrar/ocultar el mensaje de lista vacía
    function checkEmptyState() {
        if (taskList.children.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    // 4. Escuchamos los eventos (Clicks y Teclas)
    
    // Al hacer clic en el botón "Agregar"
    addBtn.addEventListener('click', addTask);

    // Al presionar la tecla "Enter" en el input
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function applyFilter() {
        // 1. Averiguar qué filtro está activo AHORA mismo
        const activeBtn = document.querySelector('.filter-btn.active');
        const filterValue = activeBtn.getAttribute('data-filter');

        // 2. Recorrer todas las tareas y decidir
        const tasks = document.querySelectorAll('.task-item');
        
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');

            // Lógica de decisión
            let shouldShow = false;
            if (filterValue === 'all') {
                shouldShow = true;
            } else if (filterValue === 'pending' && !isCompleted) {
                shouldShow = true;
            } else if (filterValue === 'completed' && isCompleted) {
                shouldShow = true;
            }

            // Aplicar la decisión
            task.style.display = shouldShow ? 'flex' : 'none';
            
            // Extra: Si la acabamos de crear con animación (slideIn), 
            // a veces hay conflictos visuales, pero esto suele bastar.
        });
        
        // 3. Revisar si con este filtro la lista parece vacía
        // (Opcional, pero queda pro: "No hay tareas completadas")
    }

    // 3. OYENTE EN TIEMPO REAL (El corazón de la app)
    // Esto sustituye a loadData(). Se ejecuta AUTOMÁTICAMENTE 
    // cada vez que algo cambia en la base de datos (incluso si lo cambia otra persona).
    const q = query(tasksCollection, orderBy("fechaCreacion", "desc"));
    
    onSnapshot(q, (snapshot) => {
        // 1. Limpiamos la lista actual para no duplicar
        taskList.innerHTML = "";
        
        // 2. Recorremos los documentos que nos da Firebase
        snapshot.forEach((doc) => {
            const data = doc.data();
            const li = createTaskElement(doc.id, data.texto, data.completada);
            taskList.appendChild(li);
        });

        // 3. Actualizamos vista vacía y filtros
        checkEmptyState();
        applyFilter(); // Si tenías implementado el filtro
    });

    // 5. Filtrado de Tareas
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Solo cambiamos la clase visual
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            
            // Y llamamos a la función maestra
            applyFilter();
        });
    });
});
