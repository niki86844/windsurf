import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Reactiver le CSS global

console.log('🚀 main.tsx entry');

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
