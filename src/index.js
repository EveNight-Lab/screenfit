import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css'; // 새로 만든 tailwind.css를 import
import App from './App';
import './i18n'; // i18n 설정을 import
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();