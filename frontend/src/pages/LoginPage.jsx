import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import Brand from "../components/Brand.jsx";

export default function LoginPage({ onLogin }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function submit(event) {
    event.preventDefault();
    setError("");
    if (!event.currentTarget.reportValidity()) return;
    try {
      onLogin(values.email, values.password, remember);
      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="showcase-glow" />
        <div className="showcase-content">
          <Brand light />
          <div className="showcase-copy">
            <div className="showcase-kicker"><Sparkles size={14} /> YOUR CAMPUS, CONNECTED</div>
            <h1>Everything campus.<br /><span>One clear view.</span></h1>
            <p>Your classes, campus updates, and next big moment — all in one place, made just for you.</p>
            <div className="showcase-stats">
              <div><strong>01</strong><span>One campus hub</span></div>
              <div className="stats-divider" />
              <div><strong>24<span>/7</span></strong><span>Always in sync</span></div>
            </div>
          </div>
          <div className="showcase-quote"><span className="quote-mark">“</span><p>A little more organized.<br />A lot more you.</p><span className="quote-spark">✳</span></div>
          <div className="showcase-footer"><span>MADE FOR YOUR NEXT CHAPTER</span><span>© 2026 CAMPUSCONNECT</span></div>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-card">
          <div className="auth-heading">
            <div className="auth-overline">YOUR CAMPUS IS WAITING</div>
            <h2>Welcome Back!</h2>
            <p>Your campus, connected in one place.</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label className="form-field">
              <span>Email address</span>
              <span className="input-wrap"><Mail size={18} /><input type="email" autoComplete="email" placeholder="you@campus.edu" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required /></span>
            </label>
            <label className="form-field">
              <span>Password</span>
              <span className="input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} minLength="6" required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
            </label>
            <div className="form-options">
              <label className="remember-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label>
              <button type="button" className="text-link" onClick={() => setError("Password recovery is not available in this frontend demo.")}>Forgot password?</button>
            </div>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <button className="submit-button" type="submit">Sign in <ArrowRight size={18} /></button>
          </form>
          <p className="auth-switch">New to CampusConnect? <Link to="/register">Create an account</Link></p>
          <div className="demo-disclaimer"><LockKeyhole size={14} /><span>Frontend demo only — no real authentication or secure account storage.</span></div>
        </div>
        <div className="auth-corner-note">A smarter way to move through your day.</div>
      </section>
    </main>
  );
}
