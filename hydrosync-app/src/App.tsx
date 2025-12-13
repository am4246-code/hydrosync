import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SurveyPage from './pages/SurveyPage';
import HomePage from './pages/HomePage';
import CongratsPage from './pages/CongratsPage';
import AuthWrapper from './components/AuthWrapper';
import './App.css';

function App() {
  return (
    <Routes>
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

