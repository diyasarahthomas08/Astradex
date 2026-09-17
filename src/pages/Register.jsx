import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [grade, setGrade] = useState("");
    const [school, setSchool] = useState("");
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        let errs = {};
        if (!name) errs.name = "Name required";
        if (!email) errs.email = "Email required";
        if (!password) errs.password = "Password required";
        if (!grade) errs.grade = "Grade required";
        if (!school) errs.school = "School required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setServerError("");
        if (!validate()) return;

        setSubmitting(true);
        try {
            const { error } = await signUp(email, password, name, grade, school);

            if (error) {
                setServerError(error.message);
                return;
            }

            // Registration successful — redirect to login
            navigate("/login");
        } catch (err) {
            setServerError("An unexpected error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="auth-layout">
            <section className="auth-panel">
                <div className="auth-card">
                    <h2 className="auth-heading">Create your Astradex account</h2>
                    <p className="auth-subheading">
                        Join thousands of students learning for their board exams with live classes and practice tests.
                    </p>

                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="auth-field">
                            <label>Full name</label>
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={errors.name ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.name && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.name}</span>}
                        </div>

                        <div className="auth-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Grade</label>
                                <select
                                    className="auth-select"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    required
                                    style={errors.grade ? { borderColor: '#ef4444' } : {}}
                                >
                                    <option value="">Select</option>
                                    <option value="IX">IX</option>
                                    <option value="X">X</option>
                                    <option value="XI">XI</option>
                                    <option value="XII">XII</option>
                                </select>
                                {errors.grade && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.grade}</span>}
                            </div>
                            <div>
                                <label>School</label>
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="School Name"
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    required
                                    style={errors.school ? { borderColor: '#ef4444' } : {}}
                                />
                                {errors.school && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.school}</span>}
                            </div>
                        </div>

                        <div className="auth-field">
                            <label>Email address</label>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={errors.email ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.email}</span>}
                        </div>

                        <div className="auth-field">
                            <label>Password</label>
                            <input
                                type="password"
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={errors.password ? { borderColor: '#ef4444' } : {}}
                            />
                            {errors.password && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.password}</span>}
                        </div>

                        {serverError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 600 }}>{serverError}</div>}

                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', borderRadius: '999px', marginTop: '0.5rem' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating account…' : 'Register'}
                        </button>

                        <div className="auth-footer-text">
                            Already have an account?{' '}
                            <span
                                className="auth-footer-link"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </span>
                        </div>
                    </form>
                </div>
            </section>

            <aside className="auth-illustration" aria-hidden="true">
                <div className="auth-blob" />
                <div className="auth-illustration-content">
                    <div className="auth-illustration-inner">
                        <div className="auth-badge">
                            <span>New here?</span>
                            <span>Start strong</span>
                        </div>
                        <h2 className="auth-illustration-title">
                            Ready to ace your board exams?
                        </h2>
                        <p className="auth-illustration-text">
                            Create your free account, pick your course and start learning with our expert faculty from day one.
                        </p>
                        <ul className="auth-illustration-points">
                            <li>Live doubt-clearing sessions</li>
                            <li>Exam-style mock tests</li>
                            <li>Track your progress in real time</li>
                        </ul>
                    </div>
                </div>
            </aside>
        </main>
    );
};

export default Register;
