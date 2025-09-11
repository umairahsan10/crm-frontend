import { useState, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import type { User } from "../../types";

export default function Login(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple login logic - you can replace this with your actual authentication
    let userData: User | null = null;

    if (email === "admin@company.com" && password === "admin123") {
      userData = {
        id: "1",
        name: "Admin User",
        email: "admin@company.com",
        role: "admin",
        department: "Administration",
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
    } else if (email === "hr@company.com" && password === "hr123") {
      userData = {
        id: "2",
        name: "HR Manager",
        email: "hr@company.com",
        role: "hr",
        department: "Human Resources",
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
    } else if (email === "accountant@company.com" && password === "acc123") {
      userData = {
        id: "3",
        name: "Accountant",
        email: "accountant@company.com",
        role: "accountant",
        department: "Finance",
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
    } else if (email === "employee@company.com" && password === "emp123") {
      userData = {
        id: "4",
        name: "Employee",
        email: "employee@company.com",
        role: "employee",
        department: "Engineering",
        isActive: true,
        lastLogin: new Date().toISOString(),
      };
    }

    if (userData) {
      login(userData);
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
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

          <button type="submit">Sign In</button>

          <div className="demo-credentials">
            <p>Demo Credentials:</p>
            <ul>
              <li><strong>Admin:</strong> admin@company.com / admin123</li>
              <li><strong>HR:</strong> hr@company.com / hr123</li>
              <li><strong>Accountant:</strong> accountant@company.com / acc123</li>
              <li><strong>Employee:</strong> employee@company.com / emp123</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
