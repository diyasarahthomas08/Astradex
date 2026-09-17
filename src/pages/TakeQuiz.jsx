import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import supabase from '../services/supabaseClient';
import { SkeletonLoader } from '../components/UIUtils';

export default function TakeQuiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [quizNotFound, setQuizNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id || !quizId) return;

    async function fetchQuiz() {
      setLoading(true);
      const [quizResult, attemptResult] = await Promise.all([
        supabase.from('quizzes').select('*').eq('id', quizId).single(),
        supabase
          .from('quiz_attempts')
          .select('score, total, answers')
          .eq('quiz_id', quizId)
          .eq('student_id', user.id)
          .maybeSingle(),
      ]);

      if (quizResult.error) {
        console.error('[TakeQuiz] Error fetching quiz:', quizResult.error.message);
        setQuizNotFound(true);
      } else {
        setQuiz(quizResult.data);
      }

      if (attemptResult.error) {
        console.error('[TakeQuiz] Error checking quiz attempt:', attemptResult.error.message);
        setError(attemptResult.error.message);
      } else {
        setAttempt(attemptResult.data);
      }
      setLoading(false);
    }

    fetchQuiz();
  }, [quizId, user?.id]);

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(current => ({ ...current, [questionIndex]: answerIndex }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!quiz || !user?.id) return;

    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const selectedAnswers = questions.map((_, index) => answers[index]);
    const score = questions.reduce((total, question, index) => (
      total + (answers[index] === question.correct_index ? 1 : 0)
    ), 0);

    const { error: insertError } = await supabase.from('quiz_attempts').insert({
      quiz_id: quizId,
      student_id: user.id,
      score,
      total: questions.length,
      answers: selectedAnswers,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        setAttempt({ score: null, total: null, answers: null });
      } else {
        setError(insertError.message);
      }
      return;
    }

    setAttempt({ score, total: questions.length });
  };

  if (loading) {
    return (
      <main className="course-detail">
        <Link to="/dashboard/student" className="inline-back">Back to Dashboard</Link>
        <SkeletonLoader height={320} />
      </main>
    );
  }

  if (quizNotFound || !quiz) {
    return (
      <main className="course-detail">
        <Link to="/dashboard/student" className="inline-back">Back to Dashboard</Link>
        <div className="card" style={{ marginTop: '2rem' }}>
          <h1 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>Quiz not found</h1>
        </div>
      </main>
    );
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  if (attempt) {
    return (
      <main className="course-detail">
        <Link to="/dashboard/student" className="inline-back">Back to Dashboard</Link>
        <div className="card" style={{ marginTop: '2rem' }}>
          <h1 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>{quiz.title}</h1>
          <p style={{ fontWeight: 700 }}>
            {attempt.score === null ? 'You already completed this quiz.' : `Score: ${attempt.score}/${attempt.total}`}
          </p>
          {Array.isArray(attempt.answers) && (
            <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
              {questions.map((question, questionIndex) => {
                const selectedAnswer = attempt.answers[questionIndex];
                const isCorrect = selectedAnswer === question.correct_index;

                return (
                  <div key={questionIndex}>
                    <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
                      {questionIndex + 1}. {question.question}
                    </p>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {(question.options || []).map((option, optionIndex) => {
                        const isSelected = selectedAnswer === optionIndex;
                        const isCorrectOption = question.correct_index === optionIndex;
                        const optionStyle = isCorrectOption
                          ? { background: 'rgba(34, 197, 94, 0.12)', color: '#15803d' }
                          : isSelected
                            ? { background: 'rgba(239, 68, 68, 0.12)', color: '#b91c1c' }
                            : {};

                        return (
                          <div
                            key={optionIndex}
                            style={{ padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-card)', ...optionStyle }}
                          >
                            {option}
                            {isSelected && !isCorrect && ' (Your answer)'}
                            {isCorrectOption && (isCorrect ? ' (Correct)' : ' (Correct answer)')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  const allAnswered = questions.length > 0 && questions.every((_, index) => answers[index] !== undefined);

  return (
    <main className="course-detail">
      <Link to="/dashboard/student" className="inline-back">Back to Dashboard</Link>
      <div className="card" style={{ marginTop: '2rem' }}>
        <h1 className="heading-medium" style={{ textAlign: 'left', fontSize: '1.8rem' }}>{quiz.title}</h1>
        {questions.length === 0 ? (
          <p>This quiz has no questions.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {questions.map((question, questionIndex) => (
              <fieldset key={questionIndex} style={{ border: 0, padding: 0, margin: '0 0 2rem' }}>
                <legend style={{ fontWeight: 700, marginBottom: '0.75rem' }}>
                  {questionIndex + 1}. {question.question}
                </legend>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {(question.options || []).map((option, optionIndex) => (
                    <label key={optionIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button type="submit" className="btn-primary" disabled={!allAnswered}>Submit Quiz</button>
          </form>
        )}
        {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
      </div>
    </main>
  );
}
