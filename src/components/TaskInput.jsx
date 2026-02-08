import { useState } from 'react';

function TaskInput({ onAddTask }) {
  const [texto, setTexto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Evita recargar página si está dentro de un form
    if (texto.trim()) {
      onAddTask(texto); // ¡Avisa al padre!
      setTexto(''); // Limpia
    }
  };

  return (
    <section className="input-group">
      <input 
        type="text" 
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="¿Qué necesitas hacer hoy?"
        autoFocus
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
      />
      <button onClick={handleSubmit} id="addBtn">Agregar</button>
    </section>
  );
}

export default TaskInput;