import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (e) {
    console.error("Error mounting React application:", e);
  }
} else {
  console.error("Failed to find the root element");
}