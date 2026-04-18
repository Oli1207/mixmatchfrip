import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import AppWrapper from './layout/AppWrapper.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </HelmetProvider>
  </StrictMode>,
)
