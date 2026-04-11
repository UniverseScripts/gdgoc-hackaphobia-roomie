import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './features/properties/HomePage';
import ExplorePage from './features/properties/ExplorePage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ProfilePage from './features/auth/ProfilePage';
import OnboardingProfilePage from './features/auth/OnboardingProfilePage';
import PersonalityTestPage from './features/auth/PersonalityTestPage';
import MatchesPage from './features/matching/MatchesPage';
import ChatListPage from './features/matching/ChatListPage';
import ChatRoomPage from './features/matching/ChatRoomPage';

import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
            <Route path="/test" element={<PersonalityTestPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat" element={<ChatListPage />} />
            <Route path="/chat/:partnerId" element={<ChatRoomPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}
