import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize stores
import { useStore } from './store/useStore';
import { useTemplateStore } from './store/templateStore';
import { useRoleStore } from './store/roleStore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
