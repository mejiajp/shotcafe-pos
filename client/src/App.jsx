import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Settings from './pages/Settings'
import SignIn from './pages/SignIn'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if a token exists in LocalStorage to determine login state
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/signin" />
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/signin"
          element={<SignIn setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex bg-opaque font-custom overflow-hidden">
                <Sidebar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
