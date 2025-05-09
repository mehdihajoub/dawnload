import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { validateEnvironmentVariables } from './lib/env';
import { initializeAuth } from './store/authStore';
import { initializeSubscription } from './store/subscriptionStore';

// Validate environment variables before rendering the app
try {
  validateEnvironmentVariables();
} catch (error) {
  console.error('Application startup failed:', error);
  // Render error message instead of app
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: system-ui; padding: 2rem; max-width: 42rem; margin: 0 auto;">
        <h1 style="color: #e11d48;">Environment Configuration Error</h1>
        <p>The application could not start due to missing or invalid environment variables.</p>
        <p>Please check the console for detailed error messages.</p>
      </div>
    `;
  }
  // Prevent app from rendering
  throw error;
}

// Initialize authentication and subscription management
initializeAuth().then(() => {
  // Initialize subscription state management after auth is initialized
  initializeSubscription();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
}).catch(error => {
  console.error('Failed to initialize authentication:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: system-ui; padding: 2rem; max-width: 42rem; margin: 0 auto;">
        <h1 style="color: #e11d48;">Authentication Error</h1>
        <p>The application could not initialize authentication.</p>
        <p>Please check the console for detailed error messages or try again later.</p>
      </div>
    `;
  }
});