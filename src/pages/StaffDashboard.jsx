
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonLoader, EmptyState } from '../components/UIUtils';
import { useAuth } from '../context/AuthContext';
import supabase from '../services/supabaseClient';
import { formatDate, formatDateTime } from '../utils/formatDate';

const StaffDashboard = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();

    const userName = profile?.full_name || '';
    const userEmail = profile?.email || '';
    const userDepartment = profile?.department || 'N/A';
    const userJoiningDate = profile?.created_at
        ? formatDate(profile.created_at)
        : 'N/A';
    const [loading, setLoading] = useState(false); // For future API
    const [allEnrollments, setAllEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
    const [quizCourses, setQuizCourses] = useState([]);
    const [staffQuizzes, setStaffQuizzes] = useState([]);
    const [quizLoading, setQuizLoading] = useState(true);
    const [quizCourseId, setQuizCourseId] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizError, setQuizError] = useState('');
    const [quizSuccess, setQuizSuccess] = useState('');
    const [savingQuiz, setSavingQuiz] = useState(false);
    const [liveClasses, setLiveClasses] = useState([]);
    const [liveClassesLoading, setLiveClassesLoading] = useState(true);
    const [liveClassCourseId, setLiveClassCourseId] = useState('');
    const [liveClassTitle, setLiveClassTitle] = useState('');
    const [liveClassMeetingLink, setLiveClassMeetingLink] = useState('');
    const [liveClassScheduledAt, setLiveClassScheduledAt] = useState('');
    const [liveClassError, setLiveClassError] = useState('');
    const [liveClassSuccess, setLiveClassSuccess] = useState('');
    const [savingLiveClass, setSavingLiveClass] = useState(false);

    useEffect(() => {
        async function fetchEnrollments() {
            if (!user?.id) {
                setEnrollmentsLoading(false);
                return;
            }

            setEnrollmentsLoading(true);
            const { data, error } = await supabase
                .from('enrollments')
                .select('progress, student_id, course_id, profiles(full_name, grade), courses(title)');

            if (error) {
                console.error('[StaffDashboard] Error fetching enrollments:', error.message);
                setAllEnrollments([]);
            } else {
                setAllEnrollments(data || []);
            }
            setEnrollmentsLoading(false);
        }

        fetchEnrollments();
    }, [user?.id]);

    useEffect(() => {
        async function fetchQuizData() {
            if (!user?.id) {
                setQuizLoading(false);
                return;
            }

            setQuizLoading(true);
            const [coursesResult, quizzesResult] = await Promise.all([
                supabase.from('courses').select('id, title'),
                supabase.from('quizzes').select('id, title, courses(title)').eq('staff_id', user.id),
            ]);

            if (coursesResult.error || quizzesResult.error) {
                setQuizError(coursesResult.error?.message || quizzesResult.error?.message);
            } else {
                setQuizCourses(coursesResult.data || []);
                setStaffQuizzes(quizzesResult.data || []);
            }
            setQuizLoading(false);
        }

        fetchQuizData();
    }, [user?.id]);

    useEffect(() => {
        async function fetchLiveClasses() {
            if (!user?.id) {
                setLiveClassesLoading(false);
                return;
            }

            setLiveClassesLoading(true);
            const { data, error } = await supabase
                .from('live_classes')
                .select('id, title, scheduled_at, courses(title)')
                .eq('staff_id', user.id)
                .order('scheduled_at', { ascending: true });

            if (error) {
                setLiveClassError(error.message);
                setLiveClasses([]);
            } else {
                setLiveClasses(data || []);
            }
            setLiveClassesLoading(false);
        }

        fetchLiveClasses();
    }, [user?.id]);

    const addQuizQuestion = () => {
        setQuizQuestions(current => [
            ...current,
            { question: '', options: ['', ''], correct_index: 0 },
        ]);
        setQuizError('');
        setQuizSuccess('');
    };

    const removeQuizQuestion = (questionIndex) => {
        setQuizQuestions(current => current.filter((_, index) => index !== questionIndex));
    };

    const updateQuizQuestion = (questionIndex, field, value) => {
        setQuizQuestions(current => current.map((question, index) => (
            index === questionIndex ? { ...question, [field]: value } : question
        )));
    };

    const updateQuizOption = (questionIndex, optionIndex, value) => {
        setQuizQuestions(current => current.map((question, index) => {
            if (index !== questionIndex) return question;
            const options = question.options.map((option, currentIndex) => currentIndex === optionIndex ? value : option);
            return { ...question, options };
        }));
    };

    const addQuizOption = (questionIndex) => {
        setQuizQuestions(current => current.map((question, index) => (
            index === questionIndex && question.options.length < 4
                ? { ...question, options: [...question.options, ''] }
                : question
        )));
    };

    const handleQuizSubmit = async (event) => {
        event.preventDefault();
        setQuizError('');
        setQuizSuccess('');

        if (!user?.id || !quizCourseId || !quizTitle.trim() || quizQuestions.length === 0) {
            setQuizError('Select a course, enter a title, and add at least one question.');
            return;
        }

        const hasInvalidQuestion = quizQuestions.some(question =>
            !question.question.trim() || question.options.some(option => !option.trim())
        );
        if (hasInvalidQuestion) {
            setQuizError('Every question and option must be filled in.');
            return;
        }

        setSavingQuiz(true);
        const { data, error } = await supabase
            .from('quizzes')
            .insert({
                course_id: quizCourseId,
                staff_id: user.id,
                title: quizTitle.trim(),
                questions: quizQuestions.map(question => ({
                    question: question.question.trim(),
                    options: question.options.map(option => option.trim()),
                    correct_index: question.correct_index,
                })),
            })
            .select('id, title, courses(title)')
            .single();

        if (error) {
            setQuizError(error.message);
        } else {
            setStaffQuizzes(current => [data, ...current]);
            setQuizCourseId('');
            setQuizTitle('');
            setQuizQuestions([]);
            setQuizSuccess('Quiz saved successfully.');
        }
        setSavingQuiz(false);
    };

    const handleLiveClassSubmit = async (event) => {
        event.preventDefault();
        setLiveClassError('');
        setLiveClassSuccess('');

        if (!user?.id || !liveClassCourseId || !liveClassTitle.trim() || !liveClassMeetingLink.trim() || !liveClassScheduledAt) {
            setLiveClassError('Course, title, meeting link, and date/time are required.');
            return;
        }

        setSavingLiveClass(true);
        const { data, error } = await supabase
            .from('live_classes')
            .insert({
                course_id: liveClassCourseId,
                staff_id: user.id,
                title: liveClassTitle.trim(),
                meeting_link: liveClassMeetingLink.trim(),
                scheduled_at: new Date(liveClassScheduledAt).toISOString(),
            })
            .select('id, title, scheduled_at, courses(title)')
            .single();

        if (error) {
            setLiveClassError(error.message);
        } else {
            setLiveClasses(current => [...current, data].sort((first, second) => new Date(first.scheduled_at) - new Date(second.scheduled_at)));
            setLiveClassCourseId('');
            setLiveClassTitle('');
            setLiveClassMeetingLink('');
            setLiveClassScheduledAt('');
            setLiveClassSuccess('Class scheduled successfully.');
        }
        setSavingLiveClass(false);
    };

    const navItems = [
        { id: 'profile', label: 'Profile' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'students', label: 'Students with Courses' },
        { id: 'quizzes', label: 'Quizzes' },
        { id: 'liveClasses', label: 'Live Classes' },
        { id: 'timetable', label: 'Timetable & Schedule' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Staff Profile</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--brand-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white' }}>
                                K
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{userName}</h3>
                                <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Senior Physics Faculty</p>
                                <div className="badge" style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'var(--brand-glow)', color: 'var(--brand-main)', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>Staff ID: AST-402</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div className="meta-block">
                                <strong>Email:</strong> {userEmail}
                            </div>
                            <div className="meta-block">
                                <strong>Department:</strong> {userDepartment}
                            </div>
                            <div className="meta-block">
                                <strong>Joining Date:</strong> {userJoiningDate}
                            </div>
                        </div>
                    </div>
                );

            case 'attendance':
                return (
                    <div className="card">
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>My Attendance</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                            {[...Array(30)].map((_, i) => (
                                <div key={i} style={{
                                    aspectRatio: '1',
                                    borderRadius: '8px',
                                    background: i === 5 || i === 12 || i === 13 || i === 26 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <span style={{ fontWeight: 'bold' }}>{i + 1}</span>
                                    <span style={{ fontSize: '0.7rem' }}>{i === 5 || i === 12 || i === 13 || i === 26 ? 'Absent' : 'Present'}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 600 }}>Total Present: 26/30 Days</p>
                    </div>
                );

            case 'students':
                return (
                    <div className="card">
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>My Students</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>Grade</th>
                                    <th style={{ padding: '1rem' }}>Enrolled Course</th>
                                    <th style={{ padding: '1rem' }}>Performance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollmentsLoading
                                    ? <tr><td colSpan="4"><SkeletonLoader height={120} /></td></tr>
                                    : allEnrollments.length === 0
                                        ? <tr><td colSpan="4"><EmptyState message="No student enrollments found." /></td></tr>
                                        : allEnrollments.map(enrollment => (
                                            <tr key={`${enrollment.student_id}-${enrollment.course_id}`}>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{enrollment.profiles?.full_name}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{enrollment.profiles?.grade}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{enrollment.courses?.title}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}><b>{enrollment.progress}% complete</b></td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'quizzes':
                return (
                    <div className="card">
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Quizzes</h2>
                        <form onSubmit={handleQuizSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <select
                                value={quizCourseId}
                                onChange={(event) => setQuizCourseId(event.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Select a course</option>
                                {quizCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Quiz title"
                                value={quizTitle}
                                onChange={(event) => setQuizTitle(event.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />

                            {quizQuestions.map((question, questionIndex) => (
                                <div key={questionIndex} style={{ display: 'grid', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder={`Question ${questionIndex + 1}`}
                                        value={question.question}
                                        onChange={(event) => updateQuizQuestion(questionIndex, 'question', event.target.value)}
                                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                    />
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name={`correct-answer-${questionIndex}`}
                                                checked={question.correct_index === optionIndex}
                                                onChange={() => updateQuizQuestion(questionIndex, 'correct_index', optionIndex)}
                                            />
                                            <input
                                                type="text"
                                                placeholder={`Option ${optionIndex + 1}`}
                                                value={option}
                                                onChange={(event) => updateQuizOption(questionIndex, optionIndex, event.target.value)}
                                                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1 }}
                                            />
                                        </div>
                                    ))}
                                    {question.options.length < 4 && (
                                        <button type="button" className="btn-secondary" onClick={() => addQuizOption(questionIndex)} style={{ justifySelf: 'start', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                            + Add Option
                                        </button>
                                    )}
                                    <button type="button" className="btn-secondary" onClick={() => removeQuizQuestion(questionIndex)} style={{ justifySelf: 'start', padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>
                                        Remove Question
                                    </button>
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button type="button" className="btn-secondary" onClick={addQuizQuestion}>+ Add Question</button>
                                <button type="submit" className="btn-primary" disabled={savingQuiz}>{savingQuiz ? 'Saving...' : 'Save Quiz'}</button>
                            </div>
                            {quizError && <p style={{ color: '#ef4444', margin: 0 }}>{quizError}</p>}
                            {quizSuccess && <p style={{ color: '#22c55e', margin: 0 }}>{quizSuccess}</p>}
                        </form>

                        <h3 style={{ marginTop: '2rem' }}>My Quizzes</h3>
                        {quizLoading
                            ? <SkeletonLoader height={100} />
                            : staffQuizzes.length === 0
                                ? <EmptyState message="No quizzes created yet." />
                                : <ul className="highlight-list">
                                    {staffQuizzes.map(quiz => (
                                        <li key={quiz.id}>{quiz.title} - {quiz.courses?.title || 'Course unavailable'}</li>
                                    ))}
                                </ul>}
                    </div>
                );

            case 'liveClasses':
                return (
                    <div className="card">
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Live Classes</h2>
                        <form onSubmit={handleLiveClassSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <select
                                value={liveClassCourseId}
                                onChange={(event) => setLiveClassCourseId(event.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Select a course</option>
                                {quizCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Class title (e.g., Physics Doubt Session)"
                                value={liveClassTitle}
                                onChange={(event) => setLiveClassTitle(event.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                            <input
                                type="text"
                                placeholder="Meet or Zoom meeting link"
                                value={liveClassMeetingLink}
                                onChange={(event) => setLiveClassMeetingLink(event.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                            <input
                                type="datetime-local"
                                value={liveClassScheduledAt}
                                onChange={(event) => setLiveClassScheduledAt(event.target.value)}
                                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={savingLiveClass}>
                                {savingLiveClass ? 'Scheduling...' : 'Schedule Class'}
                            </button>
                            {liveClassError && <p style={{ color: '#ef4444', margin: 0 }}>{liveClassError}</p>}
                            {liveClassSuccess && <p style={{ color: '#22c55e', margin: 0 }}>{liveClassSuccess}</p>}
                        </form>

                        <h3 style={{ marginTop: '2rem' }}>Scheduled Classes</h3>
                        {liveClassesLoading
                            ? <SkeletonLoader height={100} />
                            : liveClasses.length === 0
                                ? <EmptyState message="No live classes scheduled yet." />
                                : <ul className="highlight-list">
                                    {liveClasses.map(liveClass => (
                                        <li key={liveClass.id}>
                                            {liveClass.title} - {liveClass.courses?.title || 'Course unavailable'} ({formatDateTime(liveClass.scheduled_at)})
                                        </li>
                                    ))}
                                </ul>}
                    </div>
                );

            case 'timetable':
                return (
                    <div>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Upcoming Classes</h2>
                        {liveClassesLoading
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
                return <div>Select search section</div>;
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="dashboard-brand">
                    Astradex
                    <span>Staff Portal</span>
                </div>
                <nav className="dashboard-nav">
                    <ul className="dashboard-nav-list">
                        {navItems.map(item => (
                            <li key={item.id} className="dashboard-nav-item">
                                <button
                                    onClick={() => setActiveSection(item.id)}
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
            <main className="dashboard-main" style={{ overflowY: 'auto', boxSizing: 'border-box' }}>
                {renderContent()}
            </main>
        </div>
    );
};

export default StaffDashboard;
