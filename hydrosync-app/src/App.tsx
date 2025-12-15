import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SurveyPage from './pages/SurveyPage';
import HomePage from './pages/HomePage';
import CongratsPage from './pages/CongratsPage';
import AuthWrapper from './components/AuthWrapper';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LoadingPage from './pages/LoadingPage'; // Import LoadingPage
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> {/* Security & Compliance: Route for displaying Privacy Policy */}
      <Route path="/loading" element={<LoadingPage />} /> {/* New route for LoadingPage */}
      <Route element={<AuthWrapper />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/congrats" element={<CongratsPage />} />
        <Route path="/" element={<HomePage />} /> {/* Default to home, AuthWrapper will redirect if needed */}
      </Route>
    </Routes>
  );
}

export default App;

