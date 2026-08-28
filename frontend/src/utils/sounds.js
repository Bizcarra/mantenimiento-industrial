/**
 * Utilidad para reproducir sonidos de notificación en la aplicación
 */

// Crear instancias de Audio para sonidos de notificación
const sounds = {
  success: null,
  error: null,
  warning: null,
};

/**
 * Inicializa los sonidos de la aplicación
 * Los sonidos se generan mediante Web Audio API para evitar dependencias externas
 */
const initSounds = () => {
  // Solo inicializar una vez
  if (sounds.success) return;

  try {
    // Sonido de éxito - tono ascendente optimista
    sounds.success = createSuccessSound();

    // Sonido de error - tono descendente
    sounds.error = createErrorSound();

    // Sonido de advertencia - tono neutro
    sounds.warning = createWarningSound();
  } catch (error) {
    console.warn('No se pudieron inicializar los sonidos:', error);
  }
};

/**
 * Crea un sonido de éxito usando Web Audio API
 */
function createSuccessSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
}

/**
 * Crea un sonido de error usando Web Audio API
 */
function createErrorSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };
}

/**
 * Crea un sonido de advertencia usando Web Audio API
 */
function createWarningSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };
}

/**
 * Reproduce un sonido de notificación
 * @param {'success' | 'error' | 'warning'} type - Tipo de sonido a reproducir
 */
export const playNotificationSound = (type = 'success') => {
  // Inicializar sonidos si no se han cargado
  if (!sounds[type]) {
    initSounds();
  }

  try {
    if (sounds[type]) {
      sounds[type]();
    }
  } catch (error) {
    // Silenciosamente ignorar errores de audio (navegador sin soporte, etc.)
    console.debug('No se pudo reproducir el sonido:', error);
  }
};

// Inicializar sonidos al cargar el módulo
if (typeof window !== 'undefined') {
  // Esperar a que el usuario interactúe con la página (requisito de navegadores modernos)
  const initOnInteraction = () => {
    initSounds();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };

  document.addEventListener('click', initOnInteraction, { once: true });
  document.addEventListener('keydown', initOnInteraction, { once: true });
}
