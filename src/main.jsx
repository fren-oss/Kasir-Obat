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

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Render app with error boundary
try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Root element not found');
  }
  
  createRoot(root).render(
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui;">
      <h1>⚠️ Gagal memuat aplikasi</h1>
      <p>Error: ${error.message}</p>
      <button onclick="location.reload()" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
        Muat Ulang
      </button>
    </div>
  `;
}
