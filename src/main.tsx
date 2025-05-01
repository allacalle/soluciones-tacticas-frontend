// src/main.tsx (o src/main.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // O './App.jsx'
// import './index.css'; // Si tienes este archivo y no lo necesitas, puedes comentarlo o borrarlo

// *** Importa BrowserRouter desde react-router-dom ***
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* *** Envuelve tu componente <App /> con <BrowserRouter> *** */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);