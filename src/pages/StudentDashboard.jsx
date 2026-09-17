import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { SkeletonLoader, EmptyState, AnimatedCounter } from '../components/UIUtils';
import { useAuth } from '../context/AuthContext';
import supabase from '../services/supabaseClient';
import { formatDate, formatDateTime } from '../utils/formatDate';

// Reusing some styles from global CSS, but adding specific dashboard layout styles inline for simplicity
// or we could add them to styles.css. For now, inline/object styles for layout.

const StudentDashboard = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();

    const [loading, setLoading] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [quizzesByCourse, setQuizzesByCourse] = useState([]);
    const [liveClasses, setLiveClasses] = useState([]);
    const [liveClassesLoading, setLiveClassesLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(true);

    useEffect(() => {
        async function fetchEnrolledCourses() {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const [enrollmentsResult, quizzesResult] = await Promise.all([
                supabase
                    .from('enrollments')
                    .select('*, courses(*)')
                    .eq('student_id', user.id),
                supabase
                    .from('quizzes')
                    .select('id, course_id, created_at')
                    .order('created_at', { ascending: false }),
            ]);

            if (enrollmentsResult.error) {
                console.error('[StudentDashboard] Error fetching enrolled courses:', enrollmentsResult.error.message);
                setEnrolledCourses([]);
            } else {
                setEnrolledCourses(enrollmentsResult.data || []);
            }
            if (quizzesResult.error) {
                console.error('[StudentDashboard] Error fetching quizzes:', quizzesResult.error.message);
                setQuizzesByCourse([]);
            } else {
                setQuizzesByCourse(quizzesResult.data || []);
            }
            setLoading(false);
        }

        fetchEnrolledCourses();
    }, [user?.id]);

    useEffect(() => {
        async function fetchLiveClasses() {
            if (loading) return;

            const enrolledCourseIds = enrolledCourses.map(enrollment => enrollment.course_id);
            if (enrolledCourseIds.length === 0) {
                setLiveClasses([]);
                setLiveClassesLoading(false);
                return;
            }

            setLiveClassesLoading(true);
            const { data, error } = await supabase
                .from('live_classes')
                .select('id, title, meeting_link, scheduled_at, courses(title)')
                .in('course_id', enrolledCourseIds)
                .order('scheduled_at', { ascending: true });

            if (error) {
                console.error('[StudentDashboard] Error fetching live classes:', error.message);
                setLiveClasses([]);
            } else {
                setLiveClasses(data || []);
            }
            setLiveClassesLoading(false);
        }

        fetchLiveClasses();
    }, [enrolledCourses, loading]);

    useEffect(() => {
        async function fetchPayments() {
            if (!user?.id) {
                setPaymentsLoading(false);
                return;
            }

            setPaymentsLoading(true);
            const { data, error } = await supabase
                .from('payments')
                .select('amount, status, paid_at, courses(title)')
                .eq('student_id', user.id)
                .order('paid_at', { ascending: false });

            if (error) {
                console.error('[StudentDashboard] Error fetching payments:', error.message);
                setPayments([]);
            } else {
                setPayments(data || []);
            }
            setPaymentsLoading(false);
        }

        fetchPayments();
    }, [user?.id]);
    const userProfile = {
        name: profile?.full_name || '',
        email: profile?.email || '',
        grade: profile?.grade ? 'Grade ' + profile.grade : '',
        school: profile?.school || '',
    };

    const navItems = [
        { id: 'profile', label: 'Profile' },
        { id: 'enrolled', label: 'Enrolled Courses' },
        { id: 'liveClasses', label: 'Live Classes' },
        { id: 'courses', label: 'All Courses' },
        { id: 'payment', label: 'Payment Details' },
        { id: 'timetable', label: 'Timetable & Schedule' },
    ];

    const handleNavClick = (id) => {
        if (id === 'courses') {
            navigate('/courses');
        } else {
            setActiveSection(id);
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>My Profile</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--brand-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white' }}>
                                {userProfile.name ? userProfile.name[0] : ""}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{userProfile.name}</h3>
                                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>{userProfile.grade}</p>
                                <div className="badge" style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'var(--brand-glow)', color: 'var(--brand-main)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>Student</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="meta-block">
                                <strong>Email:</strong> {userProfile.email}
                            </div>
                            <div className="meta-block">
                                <strong>School:</strong> {userProfile.school}
                            </div>
                        </div>
                    </div>
                );

            case 'enrolled':
                return (
                    <div>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>My Learning</h2>
                        <div className="courses-grid visible" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {loading
                                ? Array(2).fill(0).map((_, i) => <SkeletonLoader key={i} height={180} />)
                                : enrolledCourses.length === 0
                                    ? <EmptyState message="You are not enrolled in any courses yet." />
                                    : enrolledCourses.map(enrollment => (
                                        <div key={enrollment.id} className="card course-card">
                                            <h3 className="course-title">{enrollment.courses?.title}</h3>
                                            <p className="course-desc" style={{ fontSize: '0.9rem' }}>{enrollment.courses?.tagline}</p>
                                            <div style={{ marginTop: '1rem' }}>
                                                <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${enrollment.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand-main), var(--brand-light))' }}></div>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '0.2rem' }}>{enrollment.progress}% Complete</p>
                                            </div>
                                            <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate(`/courses/${enrollment.course_id}`)}>Continue</button>
                                            {quizzesByCourse.find(quiz => quiz.course_id === enrollment.course_id) && (
                                                <button
                                                    className="btn-primary"
                                                    style={{ width: '100%', marginTop: '0.75rem' }}
                                                    onClick={() => navigate(`/quiz/${quizzesByCourse.find(quiz => quiz.course_id === enrollment.course_id).id}`)}
                                                >Take Quiz</button>
                                            )}
                                        </div>
                                    ))}
                        </div>
                    </div>
                );

            case 'liveClasses':
                return (
                    <div>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Live Classes</h2>
                        {loading || liveClassesLoading
                            ? <div className="courses-grid visible" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                <SkeletonLoader height={180} />
                            </div>
                            : enrolledCourses.length === 0
                                ? <EmptyState message="Enroll in a course to see live classes." />
                                : liveClasses.length === 0
                                    ? <EmptyState message="No upcoming live classes." />
                                    : <div className="courses-grid visible" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                        {liveClasses.map(liveClass => {
                                            const minutesUntilClass = (new Date(liveClass.scheduled_at).getTime() - Date.now()) / (1000 * 60);
                                            const canJoin = minutesUntilClass <= 15;

                                            return (
                                                <div key={liveClass.id} className="card course-card dashboard-schedule-card">
                                                    <h3 className="course-title">{liveClass.courses?.title}</h3>
                                                    <p className="course-desc" style={{ fontSize: '0.9rem' }}>{liveClass.title}</p>
                                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                        {formatDateTime(liveClass.scheduled_at)}
                                                    </p>
                                                    {canJoin
                                                        ? <a className="btn-primary" href={liveClass.meeting_link} target="_blank" rel="noreferrer" style={{ textAlign: 'center', marginTop: '1rem' }}>Join Class</a>
                                                        : <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Link available 15 minutes before class</p>}
                                                </div>
                                            );
                                        })}
                                    </div>}
                    </div>
                );

            case 'payment':
                return (
                    <div className="card">
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Payment History</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Course</th>
                                    <th style={{ padding: '1rem' }}>Amount</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentsLoading
                                    ? <tr><td colSpan="4"><SkeletonLoader height={120} /></td></tr>
                                    : payments.length === 0
                                        ? <tr><td colSpan="4"><EmptyState message="No payment history yet." /></td></tr>
                                        : payments.map((payment, index) => (
                                            <tr key={`${payment.paid_at}-${index}`}>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{formatDate(payment.paid_at)}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{payment.courses?.title}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>₹{payment.amount}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                                    {payment.status === 'paid' ? <span style={{ color: 'green', fontWeight: 600 }}>Paid</span> : payment.status}
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'timetable':
                return (
                    <div>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Upcoming Classes</h2>
                        {loading || liveClassesLoading
                            ? <SkeletonLoader height={180} />
                            : liveClasses.length === 0
                                ? <EmptyState message="No upcoming classes scheduled." />
                                : <div style={{ display: 'grid', gap: '1rem' }}>
                                    {liveClasses.map(liveClass => (
                                        <div key={liveClass.id} className="card dashboard-schedule-card">
                                            <h3 className="course-title">{liveClass.courses?.title}</h3>
                                            <p className="course-desc" style={{ marginBottom: '0.5rem' }}>{liveClass.title}</p>
                                            <p style={{ margin: 0 }}>{formatDateTime(liveClass.scheduled_at)}</p>
                                        </div>
                                    ))}
                                </div>}
                    </div>
                );

            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    Astradex
                    <span>Student Portal</span>
                </div>
                <nav className="dashboard-nav">
                    <ul className="dashboard-nav-list">
                        {navItems.map(item => (
                            <li key={item.id} className="dashboard-nav-item">
                                <button
                                    onClick={() => handleNavClick(item.id)}
                                    className={`dashboard-nav-button ${activeSection === item.id ? 'is-active' : ''}`}
                                >
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <button
                    onClick={async () => {
                        await signOut();
                        navigate('/');
                    }}
                    className="dashboard-logout"
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard;
