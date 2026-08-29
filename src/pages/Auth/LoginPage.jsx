import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { authSessionService } from '../../services/authSessionService.js';

export function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authSessionService.login(email.trim(), password);
      if (result.success) {
        onLoginSuccess?.(result.user);
      }
    } catch (err) {
      setError(
        err.message || 'Invalid credentials or unable to reach authentication server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('owner@antigravity.agency');
    setPassword('AntigravityDemo2026!');
    setError(null);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-glass-card">
        {/* Brand Header */}
        <div className="auth-brand-section">
          <div className="auth-logo-badge">
            <Sparkles size={24} className="auth-logo-sparkle" />
          </div>
          <h1 className="auth-title">Antigravity AI</h1>
          <p className="auth-subtitle">
            Agency Management & AI Intelligence Platform
          </p>
          <div className="auth-cloud-badge">
            <span className="auth-live-dot" />
            <span>Production Cloud API • Supabase Connected</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} className="auth-error-icon" />
            <span className="auth-error-text">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="auth-email">
              Agency Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                className="auth-input-field"
                placeholder="owner@antigravity.agency"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-field-label" htmlFor="auth-password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input-field"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-btn-spinner">Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill Helper */}
        <div className="auth-demo-helper">
          <button
            type="button"
            className="auth-quick-fill-btn"
            onClick={fillDemoCredentials}
          >
            <ShieldCheck size={14} />
            <span>Use Verified Agency Owner Credentials</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="auth-footer-meta">
          <span>Protected by HMAC-SHA256 JWT & Multi-Tenant Isolation</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
