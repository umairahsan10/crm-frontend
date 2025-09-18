import { useState, useEffect, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../apis/login";
import "./Login.css";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import type { User } from "../../types";

export default function Login(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, getDashboardRoute, isLoggedIn, isLoading: authLoading, isInitialized } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      const dashboardRoute = getDashboardRoute();
      navigate(dashboardRoute, { replace: true });
    }
  }, [isLoggedIn, authLoading, getDashboardRoute, navigate]);

  // Always show loading while checking authentication or not initialized
  if (authLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!isInitialized ? "Initializing..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // If logged in, show loading while redirecting
  if (isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call the login API
      const response = await loginApi({ email, password });
      
      // Transform the JWT response to our User format
      const userData: User = {
        id: response.user.sub.toString(),
        email: email,
        role: response.user.role,
        type: response.user.type,
        department: response.user.department,
        permissions: response.user.permissions,
        isActive: true,
        lastLogin: new Date().toISOString(),
      };

      // Login with the user data and token
      login(userData, response.access_token);
      
      // Get the appropriate dashboard route based on user type and department
      const dashboardRoute = getDashboardRoute();
      navigate(dashboardRoute);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bluePanel">
        <img src={logo} alt="HR Admin Logo" className="logo" />
        <div className="welcome-text">
          {/* <h1>Welcome Back</h1>
          <p>Sign in to access your HR Admin Dashboard</p> */}
        </div>
      </div>
      <div className="formPanel">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2 className="headFont">Admin Login</h2>
            {/* <p>Enter your credentials to continue</p> */}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="passwordWrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="togglePassword"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong></p>
            <ul>
              <li><strong>Email:</strong> admin@gmail.com</li>
              <li><strong>Password:</strong> admin</li>
              <li>This will bypass login and redirect to admin dashboard</li>
            </ul>           
          </div>
        </form>
      </div>
    </div>
  );
}
