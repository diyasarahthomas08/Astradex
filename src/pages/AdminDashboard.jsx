import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedCounter, SkeletonLoader, EmptyState } from '../components/UIUtils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import supabase from '../services/supabaseClient';

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('overview');
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [courseError, setCourseError] = useState('');
    const [courseForm, setCourseForm] = useState(null);
    const [courseFormError, setCourseFormError] = useState('');
    const [savingCourse, setSavingCourse] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [overviewCounts, setOverviewCounts] = useState({
        students: 0,
        staff: 0,
        courses: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            setCoursesLoading(true);
            const { data, error } = await supabase.from('courses').select('*');

            if (error) {
                setCourseError(error.message);
            } else {
                setCourses(data || []);
            }
            setCoursesLoading(false);
        }

        fetchCourses();
    }, []);

    useEffect(() => {
        async function fetchOverviewCounts() {
            const [studentsResult, staffResult, coursesResult] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
            ]);

            if (studentsResult.error || staffResult.error || coursesResult.error) {
                console.error('[AdminDashboard] Error fetching overview counts:', {
                    students: studentsResult.error?.message,
                    staff: staffResult.error?.message,
                    courses: coursesResult.error?.message,
                });
            }

            setOverviewCounts({
                students: studentsResult.count || 0,
                staff: staffResult.count || 0,
                courses: coursesResult.count || 0,
            });
            setOverviewLoading(false);
        }

        fetchOverviewCounts();
    }, []);

    useEffect(() => {
        async function fetchRecentActivity() {
            const [signupsResult, coursesResult, enrollmentsResult] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('full_name, role, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3),
                supabase
                    .from('courses')
                    .select('title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(2),
                supabase
                    .from('enrollments')
                    .select('enrolled_at, profiles(full_name), courses(title)')
                    .order('enrolled_at', { ascending: false })
                    .limit(2),
            ]);

            if (signupsResult.error || coursesResult.error || enrollmentsResult.error) {
                console.error('[AdminDashboard] Error fetching recent activity:', {
                    signups: signupsResult.error?.message,
                    courses: coursesResult.error?.message,
                    enrollments: enrollmentsResult.error?.message,
                });
            }

            const signups = (signupsResult.data || []).map(signup => ({
                text: `New ${signup.role} registered: ${signup.full_name}`,
                timestamp: signup.created_at,
            }));
            const recentCourses = (coursesResult.data || []).map(course => ({
                text: `New course added: ${course.title}`,
                timestamp: course.created_at,
            }));
            const enrollments = (enrollmentsResult.data || []).map(enrollment => ({
                text: `${enrollment.profiles?.full_name} enrolled in ${enrollment.courses?.title}`,
                timestamp: enrollment.enrolled_at,
            }));

            setRecentActivity([...signups, ...recentCourses, ...enrollments]
                .sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp))
                .slice(0, 4));
            setActivityLoading(false);
        }

        fetchRecentActivity();
    }, []);

    useEffect(() => {
        async function fetchUsers() {
            setUsersLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, role');

            if (error) {
                console.error('[AdminDashboard] Error fetching users:', error.message);
                setUsers([]);
            } else {
                setUsers(data || []);
            }
            setUsersLoading(false);
        }

        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) {
            console.error('[AdminDashboard] Error deleting user:', error.message);
        } else {
            setUsers(current => current.filter(user => user.id !== userId));
        }
    };

    const emptyCourseForm = {
        title: '',
        tagline: '',
        description: '',
        board: '',
        level: '',
        subject: '',
        price: '',
        duration: '',
        modules_count: '',
        highlights: '',
        tags: '',
        demo_video_url: '',
    };

    const openCourseForm = (course = null) => {
        setCourseForm(course ? {
            ...course,
            price: course.price ?? '',
            duration: course.duration ?? '',
            modules_count: course.modules_count ?? '',
            highlights: (course.highlights || []).join(', '),
            tags: (course.tags || []).join(', '),
        } : emptyCourseForm);
        setCourseFormError('');
    };

    const closeCourseForm = () => {
        if (!savingCourse) setCourseForm(null);
    };

    const handleCourseFormChange = (event) => {
        const { name, value } = event.target;
        setCourseForm(current => ({ ...current, [name]: value }));
    };

    const handleCourseSubmit = async (event) => {
        event.preventDefault();
        if (!courseForm.title.trim() || courseForm.price === '') {
            setCourseFormError('Title and price are required.');
            return;
        }

        const courseData = {
            title: courseForm.title.trim(),
            tagline: courseForm.tagline,
            description: courseForm.description,
            board: courseForm.board,
            level: courseForm.level,
            subject: courseForm.subject,
            price: Number(courseForm.price),
            duration: courseForm.duration === '' ? null : Number(courseForm.duration),
            modules_count: courseForm.modules_count === '' ? null : Number(courseForm.modules_count),
            highlights: courseForm.highlights.split(',').map(item => item.trim()).filter(Boolean),
            tags: courseForm.tags.split(',').map(item => item.trim()).filter(Boolean),
            demo_video_url: courseForm.demo_video_url,
        };

        setSavingCourse(true);
        if (courseForm.id) {
            const { data, error } = await supabase
                .from('courses')
                .update(courseData)
                .eq('id', courseForm.id)
                .select()
                .single();

            if (error) {
                setCourseFormError(error.message);
            } else {
                setCourses(current => current.map(course => course.id === courseForm.id ? (data || { ...course, ...courseData }) : course));
                setCourseForm(null);
            }
        } else {
            const { data, error } = await supabase
                .from('courses')
                .insert(courseData)
                .select()
                .single();

            if (error) {
                setCourseFormError(error.message);
            } else {
                setCourses(current => [...current, data]);
                setCourseForm(null);
            }
        }
        setSavingCourse(false);
    };

    const handleDeleteCourse = async (courseId) => {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) {
            setCourseError(error.message);
        } else {
            setCourses(current => current.filter(course => course.id !== courseId));
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview' },
        { id: 'users', label: 'User Management' },
        { id: 'courses', label: 'Course Management' },
        { id: 'settings', label: 'Settings' },
    ];

    const stats = [
        { label: 'Total Students', value: overviewCounts.students, color: 'var(--brand-main)' },
        { label: 'Total Staff', value: overviewCounts.staff, color: '#22c55e' },
        { label: 'Active Courses', value: overviewCounts.courses, color: '#f59e0b' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Admin Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                            {overviewLoading
                                ? Array(3).fill(0).map((_, i) => <SkeletonLoader key={i} height={80} />)
                                : stats.map((stat, i) => (
                                    <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                        <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{stat.label}</h4>
                                        <p style={{ fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0', color: stat.color }}>
                                            {stat.prefix || ''}<AnimatedCounter value={stat.value} />
                                        </p>
                                    </div>
                                ))}
                        </div>

                        <div className="card" style={{ marginTop: '2rem', maxWidth: '600px', width: '100%', boxSizing: 'border-box', marginLeft: 0 }}>
                            <h3 className="course-title">Recent Activity</h3>
                            {activityLoading
                                ? <SkeletonLoader height={120} />
                                : recentActivity.length === 0
                                    ? <EmptyState message="No recent activity yet." />
                                    : <ul className="highlight-list">
                                        {recentActivity.map((activity, index) => (
                                            <li key={`${activity.timestamp}-${index}`}>{activity.text}</li>
                                        ))}
                                    </ul>}
                        </div>
                    </div>
                );

            case 'users':
                const filteredUsers = users.filter(user =>
                    (user.full_name || '').toLowerCase().includes(userSearch.toLowerCase())
                );
                return (
                    <div className="card">
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>User Management</h2>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={userSearch}
                                onChange={(event) => setUserSearch(event.target.value)}
                                style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1 }}
                            />
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersLoading
                                    ? <tr><td colSpan="3"><SkeletonLoader height={120} /></td></tr>
                                    : filteredUsers.length === 0
                                        ? <tr><td colSpan="3"><EmptyState message={users.length === 0 ? 'No users found.' : 'No users match your search.'} /></td></tr>
                                        : filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{user.full_name}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>{user.role}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                                    <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'courses':
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem', margin: 0 }}>Course Management</h2>
                            <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={() => openCourseForm()}>+ Add Course</button>
                        </div>
                        {courseError && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{courseError}</p>}
                        {courseForm && (
                            <div className="card admin-course-form" style={{ marginTop: '2rem' }}>
                                <h3 className="course-title">{courseForm.id ? 'Edit Course' : 'Add Course'}</h3>
                                <form onSubmit={handleCourseSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                    {[
                                        ['title', 'Title'],
                                        ['tagline', 'Tagline'],
                                        ['description', 'Description'],
                                        ['board', 'Board'],
                                        ['level', 'Level'],
                                        ['subject', 'Subject'],
                                        ['price', 'Price'],
                                        ['duration', 'Duration'],
                                        ['modules_count', 'Modules'],
                                        ['highlights', 'Highlights (comma separated)'],
                                        ['tags', 'Tags (comma separated)'],
                                        ['demo_video_url', 'Demo video URL'],
                                    ].map(([name, label]) => (
                                        <label key={name} style={{ display: 'grid', gap: '0.35rem', fontWeight: 600 }}>
                                            {label}
                                            <input
                                                name={name}
                                                type={['price', 'duration', 'modules_count'].includes(name) ? 'number' : 'text'}
                                                value={courseForm[name]}
                                                onChange={handleCourseFormChange}
                                                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                            />
                                        </label>
                                    ))}
                                    {courseFormError && <p style={{ color: '#ef4444', margin: 0 }}>{courseFormError}</p>}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="submit" className="btn-primary" disabled={savingCourse}>{savingCourse ? 'Saving...' : 'Save'}</button>
                                        <button type="button" className="btn-secondary" onClick={closeCourseForm}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="courses-grid visible" style={{ marginTop: '2rem' }}>
                            {coursesLoading
                                ? <SkeletonLoader height={180} />
                                : courses.length === 0
                                    ? <EmptyState message="No courses found." />
                                    : courses.map(course => (
                                <div key={course.id} className="card admin-course-card">
                                    <h3 className="course-title" style={{ fontSize: '1.1rem' }}>{course.title}</h3>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Subject:</strong> {course.subject || 'Not specified'}</p>
                                    <p style={{ fontSize: '0.9rem' }}><strong>Level:</strong> {course.level || 'Not specified'}</p>
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openCourseForm(course)}>Edit</button>
                                        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Global Settings</h2>
                        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Site Name</label>
                                <input type="text" defaultValue="Astradex Learning" style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Contact Email</label>
                                <input type="email" defaultValue="admin@astradex.com" style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="checkbox" defaultChecked id="maintenance" />
                                <label htmlFor="maintenance" style={{ fontWeight: 600 }}>Enable Registration</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input type="checkbox" id="dark-mode" checked={theme === 'dark'} onChange={toggleTheme} />
                                <label htmlFor="dark-mode" style={{ fontWeight: 600 }}>Dark Mode</label>
                            </div>
                            <button className="btn-primary" style={{ width: '100%', boxSizing: 'border-box' }}>Save Changes</button>
                            <button type="button" className="btn-secondary" style={{ width: '100%', boxSizing: 'border-box' }} onClick={() => navigate('/register')}>Add New User</button>
                        </div>
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
                    <span>Admin Panel</span>
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

export default AdminDashboard;
