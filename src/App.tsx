import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { ProjectDetails } from './pages/ProjectDetails';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { PaymentMethods } from './pages/PaymentMethods';
import { Purchases } from './pages/Purchases';
import { Library } from './pages/Library';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Success } from './pages/Success';
import { Cancel } from './pages/Cancel';
import { NotFound } from './pages/NotFound';
import { AnimatedPage } from './components/AnimatedPage';
import { UnpaidBanner } from './components/subscription/UnpaidBanner';
import { useSubscription } from './hooks/useSubscription';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Earnings } from './pages/Earnings';
import { Payouts } from './pages/Payouts';
import { useAuthStore } from './store/authStore';
import { StripeDebug } from './pages/StripeDebug';

function App() {
  const location = useLocation();
  const { subscription } = useSubscription();
  const { user } = useAuthStore();
  
  const showUnpaidBanner = subscription?.subscription_status === 'past_due';

  return (
    <ErrorBoundary>
      {showUnpaidBanner && <UnpaidBanner />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <ErrorBoundary>
                <AnimatedPage>
                  {user ? <Dashboard /> : <Home />}
                </AnimatedPage>
              </ErrorBoundary>
            } />
            
            <Route path="browse" element={
              <ErrorBoundary>
                <AnimatedPage><Browse /></AnimatedPage>
              </ErrorBoundary>
            } />
            
            <Route path="project/:id" element={
              <ErrorBoundary>
                <AnimatedPage><ProjectDetails /></AnimatedPage>
              </ErrorBoundary>
            } />
            
            <Route path="upload" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Upload /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="profile/:username" element={
              <ErrorBoundary>
                <AnimatedPage><Profile /></AnimatedPage>
              </ErrorBoundary>
            } />
            
            <Route path="payment-methods" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><PaymentMethods /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="purchases" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Purchases /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="login" element={
              <ErrorBoundary>
                <ProtectedRoute requireAuth={false}>
                  <AnimatedPage><Login /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="register" element={
              <ErrorBoundary>
                <ProtectedRoute requireAuth={false}>
                  <AnimatedPage><Register /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="success" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Success /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="cancel" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Cancel /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="library" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Library /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="dashboard" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Dashboard /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="earnings" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Earnings /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="payouts" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><Payouts /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="stripe-debug" element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AnimatedPage><StripeDebug /></AnimatedPage>
                </ProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="*" element={
              <ErrorBoundary>
                <AnimatedPage><NotFound /></AnimatedPage>
              </ErrorBoundary>
            } />
          </Route>
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;