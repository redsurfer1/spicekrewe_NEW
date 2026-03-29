import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ForTeams from './pages/ForTeams';
import FindTalent from './pages/FindTalent';
import TalentProfile from './pages/TalentProfile';
import HireFlow from './pages/HireFlow';
import HireSuccess from './pages/HireSuccess';
import JoinAsProf from './pages/JoinAsProf';
import AdminDashboard from './components/AdminDashboard';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/Contact';
import AdminHealthPage from './pages/admin/Health';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/talent" element={<FindTalent />} />
          <Route path="/talent/:id" element={<TalentProfile />} />
          <Route path="/hire" element={<HireFlow />} />
          <Route path="/hire/success" element={<HireSuccess />} />
          <Route path="/dashboard/briefs" element={<PlaceholderPage />} />
          <Route path="/join" element={<JoinAsProf />} />
          <Route path="/how-it-works" element={<PlaceholderPage />} />
          <Route path="/for-teams" element={<ForTeams />} />
          <Route path="/login" element={<PlaceholderPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/health" element={<AdminHealthPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
