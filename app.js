// Esperamos a que el contenido de la página cargue
document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleccionamos los elementos del HTML que vamos a controlar
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Función reutilizable para crear la fila de la tarea
    function createTaskElement(texto, completada = false) {
        // 1. Crear el elemento li
        const li = document.createElement('li');
        li.className = 'task-item';
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

        // 3. Añadir la lógica de los botones (Event Listeners)
        // --- AQUÍ PEGA TU LÓGICA DE CLICS ACTUAL ---
        // (Copia aquí todo el código de addEventListener de deleteBtn, 
        //  clickTimer, el click simple y el dblclick que ya tienes hecho)
        
        // Añadimos funcionalidad al botón de borrar de esta tarea
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 1. Añadimos la clase para que empiece la animación CSS
            li.classList.add('fall');
            
            // 2. Esperamos a que termine la animación antes de borrar de verdad
            li.addEventListener('transitionend', () => {
                li.remove();
                checkEmptyState(); // Ahora sí revisamos si está vacío
                saveData();       // Y guardamos
            });
        });

        let clickTimer = null;
        // Añadimos la funcionalidad de completado
        li.addEventListener('click', () => {
            if (clickTimer) return;
            clickTimer = setTimeout(() => {
                li.classList.toggle('completed'); // Le ponemos la clase a toda la fila
                applyFilter();
                clickTimer = null;
                saveData();
            }, 300);
        });

        li.addEventListener('dblclick', () => {
            clearTimeout(clickTimer);
            clickTimer = null;
            const taskContent = li.querySelector('.task-content');
            const nuevoTexto = prompt("Editar tarea:", taskContent.innerText);
            if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
                taskContent.innerText = nuevoTexto;
            }
            saveData();
        });

        return li;
    }
    // 2. Función para añadir una nueva tarea
    function addTask() {
        // Obtenemos el texto que escribió el usuario
        const taskText = taskInput.value.trim();

        // Si está vacío, no hacemos nada
        if (taskText === "") {
            alert("Por favor escribe una tarea 🎉");
            return;
        }

        // Creamos el elemento HTML de la lista (li)
        const li = createTaskElement(taskText,false);


        // Agregamos la tarea a la lista (ul)
        taskList.appendChild(li);
        applyFilter();
        // Limpiamos el input y devolvemos el foco para escribir otra
        taskInput.value = "";
        taskInput.focus();

        // Verificamos si hay tareas para ocultar el mensaje de "vacío"
        checkEmptyState();

        saveData();
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

    function saveData() {
        const todos = [];
        // Buscamos todas las tareas actuales
        document.querySelectorAll('.task-item').forEach(li => {
            todos.push({
                text: li.querySelector('.task-content').innerText,
                completed: li.classList.contains('completed')
            });
        });
        // Guardamos en el navegador convertido a texto
        localStorage.setItem('misTareas', JSON.stringify(todos));
    }
    // CARGAR: Leemos los datos y reconstruimos las tareas
    function loadData() {
        const datos = localStorage.getItem('misTareas');
        if (datos) {
            const todos = JSON.parse(datos); // Convertimos texto a Array
            todos.forEach(tarea => {
                const li = createTaskElement(tarea.text, tarea.completed);
                taskList.appendChild(li);
            });
            checkEmptyState();
        }
        applyFilter();
    }

    loadData();
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
