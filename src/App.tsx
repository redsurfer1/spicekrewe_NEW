import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ForTeams from './pages/ForTeams';
import FindTalent from './pages/FindTalent';
import TalentProfile from './pages/TalentProfile';
import HireFlow from './pages/HireFlow';
import HireSuccess from './pages/HireSuccess';
import MatchConfirmed from './pages/hire/MatchConfirmed';
import HireSpecialtyPage from './pages/hire/HireSpecialtyPage';
import HireCulinaryConsultantPage from './pages/hire/culinary-consultant';
import HireFoodStylistPage from './pages/hire/food-stylist';
import MemphisHirePage from './pages/hire/memphis';
import NashvilleHirePage from './pages/hire/nashville';
import NewOrleansHirePage from './pages/hire/new-orleans';
import BlogIndexPage from './pages/blog/index';
import BlogPostPage from './pages/blog/BlogPostPage';
import PricingGuide2025Page from './pages/guides/PricingGuide2025Page';
import JoinAsProf from './pages/JoinAsProf';
import AdminDashboard from './components/AdminDashboard';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/Contact';
import AdminHealthPage from './pages/admin/Health';
import AdminMfaVerify from './pages/admin/AdminMfaVerify';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/talent/aisha-laurent" element={<Navigate to="/talent/aisha-thompson" replace />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/talent" element={<FindTalent />} />
          <Route path="/talent/:id" element={<TalentProfile />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/guides/pricing-2025" element={<PricingGuide2025Page />} />
          <Route path="/locations/memphis" element={<Navigate to="/hire/memphis" replace />} />
          <Route path="/hire/success" element={<HireSuccess />} />
          <Route path="/hire/match-confirmed" element={<MatchConfirmed />} />
          <Route path="/hire/memphis" element={<MemphisHirePage />} />
          <Route path="/hire/nashville" element={<NashvilleHirePage />} />
          <Route path="/hire/new-orleans" element={<NewOrleansHirePage />} />
          <Route path="/hire/culinary-consultant" element={<HireCulinaryConsultantPage />} />
          <Route path="/hire/food-stylist" element={<HireFoodStylistPage />} />
          <Route path="/hire/:specialty" element={<HireSpecialtyPage />} />
          <Route path="/hire" element={<HireFlow />} />
          <Route path="/dashboard/briefs" element={<PlaceholderPage />} />
          <Route path="/join" element={<JoinAsProf />} />
          <Route path="/how-it-works" element={<PlaceholderPage />} />
          <Route path="/for-teams" element={<ForTeams />} />
          <Route path="/login" element={<PlaceholderPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/mfa-verify" element={<AdminMfaVerify />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/health" element={<AdminHealthPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
