/**
 * Example Login Form Component for React TypeScript Website
 * 
 * This component allows users to log in to the blog system
 * from your main React TypeScript website.
 */

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, isLoading, error, isAuthenticated, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // If already logged in, show user info instead of form
  if (isAuthenticated && user) {
    return (
      <div className="login-success">
        <h3>Welcome, {user.name}!</h3>
        <p>You are logged in as <strong>{user.role}</strong>.</p>
        <button 
          onClick={() => window.location.href = '/blog/dashboard'}
          className="dashboard-button"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="login-form-container">
      <h2>Login to Blog System</h2>
      
      {error && <div className="login-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="login-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="login-help">
        <p>
          Login with admin credentials to access the blog administration panel.
          <br />
          Login with author credentials to manage your blog posts.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
