
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { SkeletonLoader, EmptyState } from '../components/UIUtils';
import { useAuth } from '../context/AuthContext';


export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!user?.id || !courseId) return;

    async function checkEnrollment() {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) {
        console.error('[CourseDetail] Error checking enrollment:', error.message);
      } else if (data) {
        setEnrolled(true);
      }
    }

    checkEnrollment();
  }, [courseId, user?.id]);

  const handleEnroll = () => {
    if (!user?.id || enrolled) return;
    setPaymentError('');
    setPaymentSuccess(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setPaymentError('Please fill in all payment fields.');
      return;
    }

    setPaymentError('');
    setPaymentProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { error: enrollmentError } = await supabase.from('enrollments').insert({
      student_id: user.id,
      course_id: courseId,
    });

    if (enrollmentError) {
      setPaymentProcessing(false);
      if (enrollmentError.code === '23505') {
        setShowPaymentModal(false);
        setEnrollmentMessage('You are already enrolled in this course');
        setEnrolled(true);
      } else {
        setPaymentError(enrollmentError.message);
      }
      return;
    }

    const { error: paymentError } = await supabase.from('payments').insert({
      student_id: user.id,
      course_id: courseId,
      amount: course.price,
      status: 'paid',
    });

    setPaymentProcessing(false);
    if (paymentError) {
      setPaymentError(paymentError.message);
      return;
    }

    setEnrolled(true);
    setEnrollmentMessage('You are enrolled in this course');
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentSuccess(false);
    }, 1000);
  };

  useEffect(() => {
    async function fetchCourse() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('[CourseDetail] Error fetching course:', error.message);
        setCourse(null);
      } else {
        setCourse({
          ...data,
          name: data.title,
          currency: 'INR',
          durationWeeks: data.duration,
          curriculum: data.curriculum || [],
          instructors: data.instructors || [],
          highlights: data.highlights || [],
          tags: data.tags || [],
          demoVideo: data.demo_video_url,
        });
      }
      setLoading(false);
    }

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <main className="course-detail"><SkeletonLoader height={320} /><SkeletonLoader height={180} /><SkeletonLoader height={180} /></main>;
  }
  if (!course) {
    return (
      <main className="course-detail" style={{ padding: '2rem 1.5rem' }}>
        <EmptyState message="The course you are looking for does not exist or has been removed." />
        <Link to="/courses" className="btn-secondary" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Catalog</Link>
      </main>
    );
  }

  return (
    <main className="course-detail" aria-labelledby="course-title">
      <div className="detail-top">
        <div className="detail-head-text">
          <h1 id="course-title" className="heading-medium" style={{ textTransform: 'none' }}>{course.name}</h1>
          <p className="paragraph-main" style={{ marginBottom: '1rem' }}>{course.tagline}</p>
          <p className="course-desc" style={{ marginBottom: '1.25rem' }}>{course.description}</p>
          <div className="price-box">
            <span className="price-value">{course.currency} {course.price}</span>
            <span className="price-duration">/ full course</span>
          </div>
          <button
            className="btn-primary enroll-btn"
            onClick={handleEnroll}
            disabled={enrolled}
          >{enrolled ? 'Enrolled' : 'Enroll Now'}</button>
          {enrollmentMessage && <p style={{ color: '#22c55e', marginTop: '0.75rem' }}>{enrollmentMessage}</p>}
          <Link to="/courses" className="inline-back">Back to catalog</Link>
        </div>
        <aside className="detail-meta">
          <div className="meta-block">
            <h2 className="meta-heading">Quick Facts</h2>
            <ul className="meta-list">
              <li><strong>Level:</strong> {course.level}</li>
              <li><strong>Duration:</strong> {course.durationWeeks} weeks</li>
              <li><strong>Modules:</strong> {course.curriculum.length}</li>
              <li><strong>Instructors:</strong> {course.instructors.length}</li>
              {course.prerequisites && course.prerequisites.length > 0 && (
                <li><strong>Prerequisites:</strong> {course.prerequisites.join(', ')}</li>
              )}
            </ul>
          </div>
          <div className="meta-block">
            <h2 className="meta-heading">Highlights</h2>
            <ul className="highlight-list">
              {course.highlights.map(h => <li key={h}>{h}</li>)}
            </ul>
          </div>
          {course.tags && course.tags.length > 0 && (
            <div className="meta-block">
              <h2 className="meta-heading">Tags</h2>
              <ul className="highlight-list">
                {course.tags.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}
          {course.upcomingBatches && course.upcomingBatches.length > 0 && (
            <div className="meta-block">
              <h2 className="meta-heading">Upcoming Batches</h2>
              <ul className="highlight-list">
                {course.upcomingBatches.map(b => (
                  <li key={b.code}>{b.code} — starts {b.start} · {b.seats} seats</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {showPaymentModal && (
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto 3rem', padding: '2rem' }}>
          <h2 className="section-subheading" style={{ marginBottom: '1rem' }}>Complete Payment</h2>
          <p style={{ marginBottom: '1rem' }}>Course price: {course.currency} {course.price}</p>
          {paymentSuccess ? (
            <p style={{ color: '#22c55e', fontWeight: 600 }}>Payment Successful</p>
          ) : (
            <form onSubmit={handlePaymentSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
              <input
                type="text"
                placeholder="Expiry (MM/YY)"
                value={expiry}
                onChange={(event) => setExpiry(event.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(event) => setCvv(event.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
              />
              {paymentError && <p style={{ color: '#ef4444', margin: 0 }}>{paymentError}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" disabled={paymentProcessing}>
                  {paymentProcessing ? 'Processing...' : 'Pay Now'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)} disabled={paymentProcessing}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {course.demoVideo && (
        <section className="demo-video-section" style={{ marginBottom: '3.5rem' }}>
          <h2 className="section-subheading">Free Demo Lesson</h2>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1.2rem', boxShadow: '0 10px 30px -5px var(--shadow-color)' }}>
            <iframe
              src={course.demoVideo}
              title={`Demo video for ${course.name}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="curriculum-section" aria-labelledby="curriculum-heading">
        <h2 id="curriculum-heading" className="section-subheading">Curriculum Outline</h2>
        <div className="curriculum-grid">
          {course.curriculum.map(m => (
            <div key={m.module} className="curriculum-card">
              <h3 className="curriculum-module">{m.module}</h3>
              <ul className="lesson-list">
                {m.lessons.map(l => <li key={l}>{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="instructors-section" aria-labelledby="instructors-heading">
        <h2 id="instructors-heading" className="section-subheading">Instructors</h2>
        <div className="instructors-grid">
          {course.instructors.map(inst => (
            <div key={inst.id} className="instructor-card">
              <div className="instructor-avatar" aria-hidden="true">{inst.name.charAt(0)}</div>
              <div className="instructor-body">
                <h3 className="instructor-name">{inst.name}</h3>
                <p className="instructor-role">{inst.role}</p>
                <p className="instructor-bio">{inst.bio}</p>
                <p className="instructor-exp">Experience: {inst.experienceYears}+ yrs</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
