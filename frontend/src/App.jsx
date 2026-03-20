import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Focus from './pages/Focus';
import Landing from './pages/Landing';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 relative overflow-hidden">
        <Routes>
          <Route path="/" element={
            <PublicRoute><Landing /></PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute><Signup /></PublicRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><Home /></PrivateRoute>
          } />
          <Route path="/focus/:id" element={
            <PrivateRoute><Focus /></PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
