import { createRoot } from 'react-dom/client'
import './styles/app.css'
import App from './App.jsx'

const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2500))])

fontsReady.then(() => {
  createRoot(document.getElementById('root')).render(<App />)
})
