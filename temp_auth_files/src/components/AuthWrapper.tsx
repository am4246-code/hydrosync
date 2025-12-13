import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import LoadingPage from '../pages/LoadingPage';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Supabase handles session persistence automatically using local storage.
    // This useEffect hook is primarily for initial redirection based on session status
    // and for reacting to real-time auth state changes (e.g., logout from another tab).
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: survey, error } = await supabase
          .from('survey')
          .select('*')
          .eq('user_id', session.user.id);

        if (survey && survey.length > 0) {
          navigate('/home');
        } else {
          if (location.pathname !== '/survey') {
            navigate('/loading');
          }
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const checkSurvey = async () => {
          const { data: survey, error } = await supabase
            .from('survey')
            .select('*')
            .eq('user_id', session.user.id);

          if (survey && survey.length > 0) {
            navigate('/home');
          } else {
            if (location.pathname !== '/survey') {
              navigate('/loading');
            }
          }
        };
        checkSurvey();
      } else {
        navigate('/');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading && location.pathname !== '/survey') {
    return <LoadingPage />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
