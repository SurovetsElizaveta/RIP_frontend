import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import store from "./store";
import { Provider } from "react-redux";
import {registerSW} from "virtual:pwa-register";

if (import.meta.env.DEV) {
  // Для разработки с самоподписанными сертификатами
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const [url, options] = args;
    
    // Если запрос к нашему локальному HTTPS бэкенду
    if (typeof url === 'string' && url.includes('https://192.168.0.55:8080')) {
      const modifiedOptions = {
        ...options,
        mode: 'cors' as RequestMode,
        credentials: 'include' as RequestCredentials,
      };
      return originalFetch(url, modifiedOptions);
    }
    
    return originalFetch(...args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)

if ("serviceWorker" in navigator) {
  registerSW()
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .catch(err => console.log("service worker not registered", err))
  })
}