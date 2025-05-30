import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/style.scss'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <App />
    </AdminAuthProvider>
  </StrictMode>,
)
