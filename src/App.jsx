import './App.css'
import { Routes, Route } from 'react-router-dom';
import Instagram from './pages/Instagram';
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Instagram />} />
      </Routes>
    </>
  )
}

export default App
