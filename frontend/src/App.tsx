import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Login/LoginPage'
import PersonaTestPage from './pages/PersonaTest/PersonaTestPage'
import OnboardingPage from './pages/Onboarding/OnboardingPage'
import ListingsPage from './pages/Listings/ListingsPage'
import MatchesPage from './pages/Matches/MatchesPage'
import ChatPage from './pages/Chat/ChatPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
          <Route path="/persona-test" element={<PersonaTestPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
