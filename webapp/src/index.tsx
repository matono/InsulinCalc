import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CookiesProvider } from "react-cookie";

const container = document.getElementById('root');
if (container != null) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </React.StrictMode>
  );
}
