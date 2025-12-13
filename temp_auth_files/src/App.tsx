import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SurveyPage from './pages/SurveyPage';
import HomePage from './pages/HomePage';
import LoadingPage from './pages/LoadingPage';
import AuthWrapper from './components/AuthWrapper'; // Import AuthWrapper
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper> {/* Wrap Routes with AuthWrapper */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/loading" element={<LoadingPage />} />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
