import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import LoadingPage from '../pages/LoadingPage';

const AuthWrapper: React.FC = () => {
  const { session, user, loading: authLoading } = useAuth();
  const [profileChecked, setProfileChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) {
      return; // Wait for supabase auth to be ready
    }

    const checkProfileAndNavigate = async () => {
      if (user && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (location.pathname === '/login' || location.pathname === '/survey' || location.pathname === '/') {
            navigate('/home');
          }
        } else {
          if (location.pathname !== '/survey') {
            navigate('/survey');
          }
        }
      } else {
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setProfileChecked(true);
    };

    checkProfileAndNavigate();
  }, [user, session, authLoading, navigate, location.pathname]);

  if (authLoading || !profileChecked) {
    return <LoadingPage />;
  }

  return <Outlet />;
};

export default AuthWrapper;
