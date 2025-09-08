import { useState, type FormEvent, type JSX } from "react";
import "./Login.css";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
// for commit
interface LoginProps {
  onLogin: (userRole: string) => void;
}

export default function Login({ onLogin }: LoginProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple login logic - you can replace this with your actual authentication
    if (email === "admin@company.com" && password === "admin123") {
      onLogin("admin");
    } else if (email === "hr@company.com" && password === "hr123") {
      onLogin("hr");
    } else if (email === "accountant@company.com" && password === "acc123") {
      onLogin("accountant");
    } else if (email === "employee@company.com" && password === "emp123") {
      onLogin("employee");
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
