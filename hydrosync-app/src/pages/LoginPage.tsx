import React, { useState, useEffect } from 'react'; // Import useEffect for side effects (like password validation)
import { useAuth } from '../context/AuthContext'; // Custom hook for authentication context
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggles between login and sign-up views
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [loading, setLoading] = useState(false); // State to manage loading during auth requests
  const [error, setError] = useState<string | null>(null); // State to display authentication errors

  // State to track if password meets various criteria for sign-up
  // This client-side validation provides immediate feedback to the user and improves UX.
  // However, server-side validation (handled by Supabase Auth) is the ultimate security measure.
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasDigit: false,
    hasSymbol: false,
  });

  const { signIn, signUp } = useAuth(); // Destructure signIn and signUp methods from auth context
  const navigate = useNavigate(); // Initialize useNavigate hook

  // useEffect to validate password against criteria whenever password or login/signup mode changes
  useEffect(() => {
    // Only perform validation if in sign-up mode
    if (!isLogin) {
      setPasswordCriteria({
        minLength: password.length >= 6, // Minimum 6 characters (as per Supabase policy)
        hasLowercase: /[a-z]/.test(password), // At least one lowercase letter
        hasUppercase: /[A-Z]/.test(password), // At least one uppercase letter
        hasDigit: /[0-9]/.test(password), // At least one digit
        hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password), // At least one symbol
      });
    }
  }, [password, isLogin]); // Re-run effect when password or isLogin changes

  // Check if all password criteria are met
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Handles both login and sign-up submissions
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true); // Set loading state to true
    setError(null); // Clear any previous errors

    try {
      if (isLogin) {
        // Attempt to sign in
        // Supabase securely handles password verification using hashed credentials.
        const { error } = await signIn(email, password);
        if (error) throw error; // If error, throw it to be caught
      } else {
        // Sign Up flow
        // Client-side check to prevent unnecessary server requests if password is clearly invalid.
        if (!isPasswordValid) {
          setLoading(false);
          setError('Password does not meet all requirements.');
          return; // Stop execution
        }

        // Attempt to sign up
        // Password is sent to Supabase Auth, where it is securely hashed and stored.
        // The plain-text password is never stored or exposed.
        const { error } = await signUp(email, password);
        if (error) {
          // Check for specific Supabase error message for duplicate email
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please login or use a different email.');
          } else {
            // General authentication error from Supabase
            setError(`Authentication error: ${error.message}`);
          }
        } else {
          // Successful sign up: redirect to loading screen
          // This flow helps maintain a good user experience by confirming account creation
          // before proceeding to onboarding steps like the survey.
          navigate('/loading');
        }
      }
    } catch (err: any) {
      // Catch and display various authentication errors
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please try again.');
      } else if (err.message === 'Email not confirmed') {
        setError('Please confirm your email address before logging in.');
      } else {
        setError(err.message); // Display generic error message for unexpected issues
      }
    }
    finally {
      setLoading(false); // Reset loading state
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
        {/* Dynamic heading based on login/signup mode */}
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
            {/* Password Requirements: Visible only in sign-up mode for user guidance */}
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
        {/* Toggle between Login and Sign Up */}
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