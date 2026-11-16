import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import Brand from "../components/Brand.jsx";

const initialForm = { name: "", studentId: "", email: "", phone: "", department: "", semester: "", password: "", confirmPassword: "" };

export default function RegisterPage({ onRegister }) {
  const [values, setValues] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function update(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    setError("");
    if (values.password !== values.confirmPassword) {
      setError("Your passwords do not match. Please try again.");
      return;
    }
    try {
      onRegister(values);
      navigate("/dashboard", { replace: true });
    } catch (registrationError) {
      setError(registrationError.message);
    }
  }

  return (
    <main className="register-page">
      <div className="register-top"><Brand /><span>Already a member? <Link to="/login">Sign in</Link></span></div>
      <section className="register-card">
        <div className="register-heading">
          <div className="auth-overline">YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Create your account</h1>
          <p>Get your campus life organized, all in one place.</p>
        </div>
        <form className="register-form" onSubmit={submit}>
          <label className="form-field"><span>Full name</span><span className="input-wrap"><UserRound size={18} /><input name="name" autoComplete="name" placeholder="e.g. Aarav Sharma" value={values.name} onChange={update} minLength="2" maxLength="100" required /></span></label>
          <label className="form-field"><span>USN / Student ID</span><span className="input-wrap input-no-icon"><input name="studentId" placeholder="e.g. 4NI22CS042" value={values.studentId} onChange={update} required /></span></label>
          <label className="form-field"><span>Email address</span><span className="input-wrap"><Mail size={18} /><input type="email" name="email" autoComplete="email" placeholder="you@campus.edu" value={values.email} onChange={update} required /></span></label>
          <label className="form-field"><span>Phone number</span><span className="input-wrap"><Phone size={18} /><input type="tel" name="phone" autoComplete="tel" placeholder="+91 98765 43210" value={values.phone} onChange={update} required /></span></label>
          <label className="form-field"><span>Department</span><span className="input-wrap input-no-icon"><select name="department" value={values.department} onChange={update} required><option value="" disabled>Select your department</option><option>Computer Science &amp; Engineering</option><option>Information Science</option><option>Electronics &amp; Communication</option><option>Mechanical Engineering</option><option>Electrical &amp; Electronics</option><option>Civil Engineering</option></select></span></label>
          <label className="form-field"><span>Semester</span><span className="input-wrap input-no-icon"><select name="semester" value={values.semester} onChange={update} required><option value="" disabled>Select semester</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={`${index + 1}${["st", "nd", "rd"][index] || "th"} Semester`}>{index + 1}{["st", "nd", "rd"][index] || "th"} Semester</option>)}</select></span></label>
          <label className="form-field"><span>Password</span><span className="input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} name="password" autoComplete="new-password" placeholder="At least 8 characters" value={values.password} onChange={update} minLength="8" required /><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <label className="form-field"><span>Confirm password</span><span className="input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} name="confirmPassword" autoComplete="new-password" placeholder="Enter your password again" value={values.confirmPassword} onChange={update} minLength="8" required /></span></label>
          {error && <div className="form-alert register-alert" role="alert">{error}</div>}
          <button className="submit-button register-submit" type="submit">Create account <ArrowRight size={18} /></button>
        </form>
        <div className="demo-disclaimer"><LockKeyhole size={14} /><span>Demo account data is stored locally in this browser only.</span></div>
      </section>
      <footer className="register-footer">CAMPUSCONNECT <span>·</span> YOUR CAMPUS, CONNECTED IN ONE PLACE</footer>
    </main>
  );
}
