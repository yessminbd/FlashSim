import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import { CartProvider } from './context/CartContext.jsx'
import { RegionProvider } from './context/RegionContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RegionProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </RegionProvider>
    </BrowserRouter>
  </StrictMode>,
);
