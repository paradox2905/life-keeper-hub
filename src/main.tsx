import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserProfileProvider>
        <App />
      </UserProfileProvider>
    </ThemeProvider>
  </React.StrictMode>
);
