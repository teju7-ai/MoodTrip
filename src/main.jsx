import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Planner from './Planner.jsx'
import Itinerary from './Itinerary.jsx'
import Confirm from './Confirm.jsx'
import Shared from './Shared.jsx'
import About from './About.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/shared/:shareToken" element={<Shared />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)