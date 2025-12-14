import React, { useState, useEffect } from 'react'; // Import useEffect
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasDigit: false,
    hasSymbol: false,
  });
  const { signIn, signUp } = useAuth(); // Use the useAuth hook
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (!isLogin) {
      setPasswordCriteria({
        minLength: password.length >= 6,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasDigit: /[0-9]/.test(password),
        hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      });
    }
  }, [password, isLogin]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        // Sign Up - Only proceed if password is valid
        if (!isPasswordValid) {
          setLoading(false);
          setError('Password does not meet all requirements.');
          return;
        }

        const { error } = await signUp(email, password);
        if (error) {
          // Check for duplicate email error (Supabase specific error message)
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please login or use a different email.');
          } else {
            throw error;
          }
        } else {
          // Successful sign up
          navigate('/survey'); // Redirect to survey page
        }
      }
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else if (err.message === 'Email not confirmed') {
        setError('Please confirm your email address before logging in.');
      }
       else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <header className="login-header">
        <h1>
          <img src="/nmn.png" alt="HydroSync logo" className="header-logo" />
          HydroSync
        </h1>
      </header>
      <div className="auth-box">
        <h2>{isLogin ? 'Welcome Back, Lets Get Hydrating!' : 'New Here? Start Your Hydration Journey!'}</h2>
        <form onSubmit={handleAuth}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Password Requirements */}
            {!isLogin && (
              <div className="password-requirements">
                <p className={passwordCriteria.minLength ? 'valid' : 'invalid'}>
                  {passwordCriteria.minLength ? '✔' : '✖'} Minimum 6 characters
                </p>
                <p className={passwordCriteria.hasLowercase ? 'valid' : 'invalid'}> At least one lowercase letter
                </p>
                <p className={passwordCriteria.hasUppercase ? 'valid' : 'invalid'}> At least one uppercase letter
                </p>
                <p className={passwordCriteria.hasDigit ? 'valid' : 'invalid'}> At least one digit
                </p>
                <p className={passwordCriteria.hasSymbol ? 'valid' : 'invalid'}> At least one symbol
                </p>
              </div>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading || (!isLogin && !isPasswordValid)}>
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;