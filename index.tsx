
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const splashScreen = document.getElementById('splash-screen');
if (splashScreen) {
  // Start the fade out
  splashScreen.classList.add('hidden');
  // Remove from DOM after transition
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.style.display = 'none';
    }
  }, 500); // Must match CSS transition duration
}
