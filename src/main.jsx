import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import "./styles.css";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// Unlock screen orientation for landscape support
if ('orientation' in screen && 'unlock' in screen.orientation) {
  screen.orientation.unlock().catch((err) => {
    console.log('Orientation unlock:', err.message);
  });
}

// Allow any orientation
if ('lock' in screen.orientation) {
  // Don't lock, allow free rotation
  window.addEventListener('orientationchange', () => {
    console.log('Orientation changed to:', screen.orientation.type);
  });
}

createRoot(document.getElementById("root")).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>,
);
