import { useState, useRef } from 'react';

const useLongPress = (onLongPress, onClick, { delay = 800 } = {}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const timerRef = useRef();

  const start = () => {
    setIsLongPress(false);
    timerRef.current = setTimeout(() => {
      setIsLongPress(true);
      onLongPress(); // ¡Disparamos el evento!
      // Vibración háptica si el móvil lo soporta
      if (navigator.vibrate) navigator.vibrate(50); 
    }, delay);
  };

  const clear = () => {
    clearTimeout(timerRef.current);
  };

  const stop = (e) => {
    clear();
    // Si NO fue pulsación larga, ejecutamos el click normal
    if (!isLongPress && onClick) {
      onClick(e);
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};

export default useLongPress;