import { useRef } from "react";

const SOUND_PATHS = [
  "/sounds/keystroke1.mp3",
  "/sounds/keystroke2.mp3",
  "/sounds/keystroke3.mp3",
  "/sounds/keystroke4.mp3",
];

/**
 * useKeyboardSound
 * Lazily initialises keystroke audio objects the first time they are needed,
 * keeping them inside a React ref so they are scoped to the component tree
 * and properly cleaned up if the component unmounts.
 */
function useKeyboardSound() {
  // Lazy-init: the Audio objects are only created once, on first call.
  const soundsRef = useRef(null);

  const getSounds = () => {
    if (!soundsRef.current) {
      soundsRef.current = SOUND_PATHS.map((path) => new Audio(path));
    }
    return soundsRef.current;
  };

  const playRandomKeyStrokeSound = () => {
    const sounds = getSounds();
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const sound = sounds[randomIndex];
    sound.currentTime = 0; // reset to start so rapid typing still fires
    sound.play().catch((err) => console.warn("Audio play failed.", err));
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;