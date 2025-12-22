import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ====================================
// تجاهل أخطاء Chrome Extensions
// ====================================
// هذا الكود يتجاهل الخطأ الشهير:
// "Could not establish connection. Receiving end does not exist."
// الذي تسببه Chrome Extensions عند محاولة الاتصال بـ background scripts

if (typeof window !== 'undefined') {
  // تجاهل الأخطاء في رسائل postMessage
  const originalPostMessage = window.postMessage;
  window.postMessage = function(...args) {
    try {
      return originalPostMessage.apply(this, args);
    } catch (error: any) {
      if (error?.message?.includes?.('Could not establish connection')) {
        // تجاهل الخطأ بصمت
        return;
      }
      throw error;
    }
  };

  // تجاهل unhandled promise rejections من Chrome
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    
    if (
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Extension context invalidated')
    ) {
      event.preventDefault(); // منع عرض الخطأ
    }
  });

  // تجاهل أخطاء Console من Chrome
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    
    if (
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Extension context invalidated')
    ) {
      event.preventDefault(); // منع عرض الخطأ
    }
  });
}

// ====================================

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