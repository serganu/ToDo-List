import { auth } from '../firebase';
import useLongPress from '../hooks/useLongPress'; // ¡Importamos la magia!

const formatDate = (timestamp) => {
  /* ... (tu función de fecha igual) ... */
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
  });
};

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const isCompleted = task.completada;

  // Configuramos el Hook
  const longPressProps = useLongPress(
    () => onEdit(task),   // Acción Larga (Editar)
    () => onToggle(task), // Acción Corta (Completar)
    { delay: 600 }        // Tiempo de espera (ms)
  );

  return (
    <li className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div 
        className="task-info" 
        {...longPressProps} // ¡Esparcimos los eventos aquí!
        style={{ userSelect: 'none' }} // Importante: Evita que se seleccione el texto al mantener pulsado
      >
        <span className="task-content">{task.texto}</span>
        
        <small className="task-creator">
            Creado por {task.creadaPorNombre || 'Anónimo'} el {formatDate(task.fechaCreacion)}
            {isCompleted && task.completadaPor && (
               <span className="completed-info">
                 <br/>✅ Completado por {task.completadaPor} el {formatDate(task.fechaCompletada)}
               </span>
            )}
        </small>
      </div>

      <div className="action-buttons">
        <button 
          className="delete-btn" 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default TaskItem;